import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';
import '../theme/theme_controller.dart';
import '../widgets/app_image.dart';
import '../widgets/language_picker_dialog.dart';
import 'ad_details_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  List<dynamic> _categories = [];
  List<dynamic> _ads = [];
  Set<int> _savedAdIds = {};
  String? _selectedCategory;
  String? _selectedCategoryName;

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onInputChanged);
    _locationController.addListener(_onInputChanged);
    _loadInitialData();
  }

  void _onInputChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _searchController.removeListener(_onInputChanged);
    _locationController.removeListener(_onInputChanged);
    _searchController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    setState(() => _loading = true);
    try {
      final catsFuture = ApiService.getCategories();
      final adsFuture = ApiService.getAds();
      final savedIdsFuture = ApiService.getSavedAdIds();

      final results = await Future.wait([catsFuture, adsFuture, savedIdsFuture]);

      if (mounted) {
        setState(() {
          _categories = results[0] as List<dynamic>;
          _ads = results[1] as List<dynamic>;
          _savedAdIds = results[2] as Set<int>;
        });
      }
    } catch (e) {
      debugPrint('Error loading initial data: $e');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _fetchAds() async {
    setState(() => _loading = true);
    try {
      final ads = await ApiService.getAds(
        category: _selectedCategory,
        search: _searchController.text.trim(),
        location: _locationController.text.trim(),
      );
      if (mounted) {
        setState(() {
          _ads = ads;
        });
      }
    } catch (e) {
      debugPrint('Error fetching ads: $e');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _toggleSaved(Map<String, dynamic> ad) async {
    final adId = ad['id'] as int;
    final willBeSaved = !_savedAdIds.contains(adId);

    // Optimistic UI update immediately
    setState(() {
      if (willBeSaved) {
        _savedAdIds.add(adId);
      } else {
        _savedAdIds.remove(adId);
      }
    });

    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 1),
          backgroundColor: willBeSaved ? const Color(0xFF0D9488) : Colors.grey.shade800,
          content: Text(
            willBeSaved ? tr('details_added_saved') : tr('details_removed_saved'),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    final actualState = await ApiService.toggleSavedAd(adId, ad);
    if (mounted && actualState != willBeSaved) {
      setState(() {
        if (actualState) {
          _savedAdIds.add(adId);
        } else {
          _savedAdIds.remove(adId);
        }
      });
    }
  }

  void _selectCategory(String? slug, String? name) {
    setState(() {
      _selectedCategory = slug;
      _selectedCategoryName = name;
    });
    Navigator.pop(context); // Close Drawer
    _fetchAds();
  }

  void _clearAllFilters() {
    setState(() {
      _selectedCategory = null;
      _selectedCategoryName = null;
      _searchController.clear();
      _locationController.clear();
    });
    _fetchAds();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListenableBuilder(
      listenable: LanguageController.instance,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,

          // Hamburger Drawer with all 25 Categories
          drawer: Drawer(
            backgroundColor: Theme.of(context).cardColor,
            child: Column(
              children: [
                // Drawer Header
                DrawerHeader(
                  decoration: BoxDecoration(
                    color: isDark
                        ? const Color(0xFF0F172A)
                        : const Color(0xFF002F34),
                  ),
                  child: SafeArea(
                    bottom: false,
                    child: SizedBox(
                      width: double.infinity,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          RichText(
                            text: const TextSpan(
                              text: 'Deally',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 24,
                              ),
                              children: [
                                TextSpan(
                                  text: 'hub',
                                  style: TextStyle(color: Color(0xFF0D9488)),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${tr("home_categories")} (${_categories.length})',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // All Categories Option
                ListTile(
                  leading: Icon(
                    Icons.grid_view_rounded,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  title: Text(
                    tr('home_all_categories'),
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  trailing: _selectedCategory == null
                      ? const Icon(Icons.check, color: Color(0xFF0D9488), size: 18)
                      : null,
                  selected: _selectedCategory == null,
                  selectedTileColor: isDark
                      ? const Color(0xFF1E293B)
                      : const Color(0xFFF0FDFA),
                  onTap: () => _selectCategory(null, null),
                ),
                const Divider(height: 1),

                // 25 Categories List
                Expanded(
                  child: ListView.builder(
                    padding: EdgeInsets.zero,
                    itemCount: _categories.length,
                    itemBuilder: (ctx, idx) {
                      final cat = _categories[idx];
                      final slug = cat['slug'] as String;
                      final rawName = cat['name'] as String;
                      final name = trCat(slug, rawName);
                      final isSelected = _selectedCategory == slug;

                      return ListTile(
                        dense: true,
                        leading: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF0D9488) : Colors.grey.shade400,
                            shape: BoxShape.circle,
                          ),
                        ),
                        title: Text(
                          name,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected
                                ? const Color(0xFF0D9488)
                                : Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check, color: Color(0xFF0D9488), size: 16)
                            : null,
                        selected: isSelected,
                        selectedTileColor: isDark
                            ? const Color(0xFF1E293B)
                            : const Color(0xFFF0FDFA),
                        onTap: () => _selectCategory(slug, name),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          appBar: AppBar(
            backgroundColor: Theme.of(context).colorScheme.surface,
            elevation: 0,
            leading: Builder(
              builder: (ctx) => IconButton(
                icon: Icon(
                  Icons.menu_rounded,
                  color: Theme.of(context).colorScheme.onSurface,
                  size: 26,
                ),
                tooltip: tr('home_browse_categories'),
                onPressed: () => Scaffold.of(ctx).openDrawer(),
              ),
            ),
            title: Row(
              children: [
                RichText(
                  text: TextSpan(
                    text: 'Deally',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurface,
                      fontWeight: FontWeight.w900,
                      fontSize: 22,
                    ),
                    children: const [
                      TextSpan(
                        text: 'hub',
                        style: TextStyle(color: Color(0xFF0D9488)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              // Theme Toggle Button (Light / Dark mode)
              IconButton(
                icon: Icon(
                  isDark
                      ? Icons.light_mode_rounded
                      : Icons.dark_mode_rounded,
                  color: isDark
                      ? const Color(0xFFFBBF24)
                      : Theme.of(context).colorScheme.onSurface,
                  size: 22,
                ),
                tooltip: isDark
                    ? tr('theme_switch_to_light')
                    : tr('theme_switch_to_dark'),
                onPressed: () => ThemeController.instance.toggleTheme(context),
              ),
              IconButton(
                icon: Icon(
                  Icons.language_rounded,
                  color: Theme.of(context).colorScheme.onSurface,
                  size: 22,
                ),
                tooltip: tr('lang_picker_title'),
                onPressed: () => LanguagePickerDialog.show(context),
              ),
              IconButton(
                icon: Icon(
                  Icons.refresh,
                  color: Theme.of(context).colorScheme.onSurface,
                  size: 20,
                ),
                tooltip: tr('common_refresh'),
                onPressed: _loadInitialData,
              ),
            ],
          ),

          body: RefreshIndicator(
            color: const Color(0xFF0D9488),
            onRefresh: () async {
              await _loadInitialData();
            },
            child: CustomScrollView(
              slivers: [
                // Modern Search & Location Header
                SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      boxShadow: [
                        BoxShadow(
                          color: isDark
                              ? const Color(0x33000000)
                              : const Color(0x0A000000),
                          offset: const Offset(0, 2),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 1. Full-width Main Search Bar
                        Container(
                          height: 46,
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF0F172A)
                                : const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Theme.of(context).dividerColor,
                            ),
                          ),
                          child: TextField(
                            controller: _searchController,
                            textInputAction: TextInputAction.search,
                            style: TextStyle(
                              fontSize: 14,
                              color: Theme.of(context).colorScheme.onSurface,
                              fontWeight: FontWeight.w500,
                            ),
                            decoration: InputDecoration(
                              hintText: tr('home_search_placeholder'),
                              hintStyle: TextStyle(
                                fontSize: 13,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : Colors.grey.shade500,
                                fontWeight: FontWeight.normal,
                              ),
                              prefixIcon: Icon(
                                Icons.search_rounded,
                                color: isDark
                                    ? const Color(0xFF2DD4BF)
                                    : const Color(0xFF002F34),
                                size: 22,
                              ),
                              suffixIcon: _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.close_rounded, size: 18, color: Colors.grey),
                                      splashRadius: 18,
                                      tooltip: tr('common_delete'),
                                      onPressed: () {
                                        _searchController.clear();
                                        _fetchAds();
                                      },
                                    )
                                  : null,
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            onSubmitted: (_) => _fetchAds(),
                          ),
                        ),

                        const SizedBox(height: 8),

                        // 2. Location Input (Directly UNDER the search bar) + Search Button
                        Row(
                          children: [
                            // Location field
                            Expanded(
                              child: Container(
                                height: 44,
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? const Color(0xFF0F172A)
                                      : const Color(0xFFF3F4F6),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: Theme.of(context).dividerColor,
                                  ),
                                ),
                                child: TextField(
                                  controller: _locationController,
                                  textInputAction: TextInputAction.search,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Theme.of(context).colorScheme.onSurface,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: tr('home_location_placeholder'),
                                    hintStyle: TextStyle(
                                      fontSize: 13,
                                      color: isDark
                                          ? const Color(0xFF94A3B8)
                                          : Colors.grey.shade500,
                                      fontWeight: FontWeight.normal,
                                    ),
                                    prefixIcon: const Icon(
                                      Icons.location_on_rounded,
                                      color: Color(0xFF0D9488),
                                      size: 19,
                                    ),
                                    suffixIcon: _locationController.text.isNotEmpty
                                        ? IconButton(
                                            icon: const Icon(Icons.close_rounded, size: 18, color: Colors.grey),
                                            splashRadius: 18,
                                            tooltip: tr('common_delete'),
                                            onPressed: () {
                                              _locationController.clear();
                                              _fetchAds();
                                            },
                                          )
                                        : null,
                                    border: InputBorder.none,
                                    contentPadding: const EdgeInsets.symmetric(vertical: 11),
                                  ),
                                  onSubmitted: (_) => _fetchAds(),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Search submit button
                            SizedBox(
                              height: 44,
                              child: ElevatedButton.icon(
                                onPressed: _fetchAds,
                                icon: const Icon(Icons.search_rounded, size: 18),
                                label: Text(
                                  tr('common_search'),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.2,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isDark
                                      ? const Color(0xFF0D9488)
                                      : const Color(0xFF002F34),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(horizontal: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),

                        // Active Filters Indicator Row
                        if (_selectedCategory != null ||
                            _searchController.text.trim().isNotEmpty ||
                            _locationController.text.trim().isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              // Active Category Chip
                              if (_selectedCategory != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF134E4A) : const Color(0xFFF0FDFA),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFF0D9488)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.grid_view_rounded, size: 12, color: Color(0xFF0D9488)),
                                      const SizedBox(width: 4),
                                      Text(
                                        trCat(_selectedCategory!, _selectedCategoryName ?? _selectedCategory!),
                                        style: TextStyle(
                                          color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0D9488),
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            _selectedCategory = null;
                                            _selectedCategoryName = null;
                                          });
                                          _fetchAds();
                                        },
                                        child: Icon(Icons.close, size: 14, color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0D9488)),
                                      ),
                                    ],
                                  ),
                                ),

                              // Active Search Query Chip
                              if (_searchController.text.trim().isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF3F4F6),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: isDark ? const Color(0xFF475569) : Colors.grey.shade400),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.search, size: 12, color: isDark ? const Color(0xFF2DD4BF) : const Color(0xFF002F34)),
                                      const SizedBox(width: 4),
                                      ConstrainedBox(
                                        constraints: const BoxConstraints(maxWidth: 120),
                                        child: Text(
                                          '"${_searchController.text.trim()}"',
                                          style: TextStyle(
                                            color: isDark ? Colors.white : const Color(0xFF002F34),
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      GestureDetector(
                                        onTap: () {
                                          _searchController.clear();
                                          _fetchAds();
                                        },
                                        child: Icon(Icons.close, size: 14, color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                                      ),
                                    ],
                                  ),
                                ),

                              // Active Location Chip
                              if (_locationController.text.trim().isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF134E4A) : const Color(0xFFF0FDFA),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFF0D9488)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.location_on_rounded, size: 12, color: Color(0xFF0D9488)),
                                      const SizedBox(width: 4),
                                      ConstrainedBox(
                                        constraints: const BoxConstraints(maxWidth: 120),
                                        child: Text(
                                          _locationController.text.trim(),
                                          style: TextStyle(
                                            color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0D9488),
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      GestureDetector(
                                        onTap: () {
                                          _locationController.clear();
                                          _fetchAds();
                                        },
                                        child: Icon(Icons.close, size: 14, color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0D9488)),
                                      ),
                                    ],
                                  ),
                                ),

                              // Clear All Filters text button
                              GestureDetector(
                                onTap: _clearAllFilters,
                                child: const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                  child: Text(
                                    'Clear filters',
                                    style: TextStyle(
                                      color: Color(0xFFEF4444),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                // Results Count & Section Header
                if (!_loading && _ads.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            (_selectedCategory != null ||
                                    _searchController.text.trim().isNotEmpty ||
                                    _locationController.text.trim().isNotEmpty)
                                ? '${tr('common_search')}: ${_ads.length}'
                                : '${tr('home_recent_ads')} (${_ads.length})',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurface,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Advertisements Grid (2x2 fitted for mobile screens)
                _loading
                    ? const SliverFillRemaining(
                        child: Center(child: CircularProgressIndicator(color: Color(0xFF0D9488))),
                      )
                    : _ads.isEmpty
                        ? SliverFillRemaining(
                            child: Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.search_off_rounded, size: 48, color: Colors.grey),
                                  const SizedBox(height: 10),
                                  Text(
                                    tr('home_no_ads'),
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.onSurface,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    tr('home_no_ads_desc'),
                                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                                  ),
                                  const SizedBox(height: 14),
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      if (_selectedCategory != null ||
                                          _searchController.text.trim().isNotEmpty ||
                                          _locationController.text.trim().isNotEmpty) {
                                        _clearAllFilters();
                                      } else {
                                        _loadInitialData();
                                      }
                                    },
                                    icon: Icon(
                                      (_selectedCategory != null ||
                                              _searchController.text.trim().isNotEmpty ||
                                              _locationController.text.trim().isNotEmpty)
                                          ? Icons.filter_alt_off_rounded
                                          : Icons.refresh,
                                      size: 18,
                                    ),
                                    label: Text(
                                      (_selectedCategory != null ||
                                              _searchController.text.trim().isNotEmpty ||
                                              _locationController.text.trim().isNotEmpty)
                                          ? tr('home_clear_filters')
                                          : tr('common_refresh'),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Theme.of(context).brightness == Brightness.dark
                                          ? const Color(0xFF0D9488)
                                          : const Color(0xFF002F34),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : SliverPadding(
                            padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
                            sliver: SliverGrid(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.77,
                                crossAxisSpacing: 10,
                                mainAxisSpacing: 10,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (ctx, idx) {
                                  final ad = _ads[idx];
                                  final images = (ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
                                  final cover = images.isNotEmpty ? images[0] : null;
                                  final price = ad['price'] ?? 0;
                                  final currency = ad['currency'] ?? 'USD';
                                  final title = ad['title'] ?? '';
                                  final location = ad['location'] ?? 'Entire Country';
                                  final adId = ad['id'] as int;
                                  final isSaved = _savedAdIds.contains(adId);
                                  final numPrice = double.tryParse('$price') ?? 0.0;
                                  final isFree = numPrice == 0;
                                  final origPrice = ad['original_price'] != null ? double.tryParse('${ad['original_price']}') : null;
                                  final hasPromo = origPrice != null && origPrice > numPrice && numPrice > 0;
                                  final discountPct = hasPromo ? ((origPrice - numPrice) / origPrice * 100).round() : 0;
                                  final catSlug = (ad['category_slug'] ?? ad['category'] ?? '').toString();
                                  final catName = (ad['category_name'] ?? ad['category'] ?? '').toString();

                                  return Card(
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14),
                                      side: BorderSide(color: Theme.of(context).dividerColor),
                                    ),
                                    elevation: 0,
                                    clipBehavior: Clip.antiAlias,
                                    color: Theme.of(context).cardColor,
                                    child: InkWell(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => AdDetailsScreen(
                                              ad: ad,
                                              initialSaved: isSaved,
                                              onSavedChanged: _loadInitialData,
                                            ),
                                          ),
                                        );
                                      },
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Image
                                          Stack(
                                            children: [
                                              AspectRatio(
                                                aspectRatio: 1.25,
                                                child: Container(
                                                  color: Theme.of(context).brightness == Brightness.dark
                                                      ? const Color(0xFF0F172A)
                                                      : Colors.grey.shade100,
                                                  child: AppImage(
                                                    imageUrl: cover,
                                                    fit: BoxFit.cover,
                                                  ),
                                                ),
                                              ),
                                              if (hasPromo)
                                                Positioned(
                                                  bottom: 6,
                                                  left: 6,
                                                  child: Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: const Color(0xFFDC2626),
                                                      borderRadius: BorderRadius.circular(6),
                                                      boxShadow: const [
                                                        BoxShadow(color: Colors.black26, blurRadius: 2),
                                                      ],
                                                    ),
                                                    child: Text(
                                                      '-$discountPct%',
                                                      style: const TextStyle(
                                                        color: Colors.white,
                                                        fontWeight: FontWeight.w900,
                                                        fontSize: 10,
                                                        letterSpacing: 0.2,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              Positioned(
                                                top: 4,
                                                right: 4,
                                                child: GestureDetector(
                                                  behavior: HitTestBehavior.opaque,
                                                  onTap: () => _toggleSaved(ad),
                                                  child: Container(
                                                    width: 36,
                                                    height: 36,
                                                    decoration: BoxDecoration(
                                                      color: Theme.of(context).brightness == Brightness.dark
                                                          ? const Color(0xCC1E293B)
                                                          : const Color(0xE6FFFFFF),
                                                      shape: BoxShape.circle,
                                                      boxShadow: const [
                                                        BoxShadow(color: Colors.black12, blurRadius: 4),
                                                      ],
                                                    ),
                                                    child: Center(
                                                      child: Icon(
                                                        isSaved ? Icons.favorite : Icons.favorite_border,
                                                        size: 18,
                                                        color: isSaved ? Colors.redAccent : Colors.grey.shade500,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),

                                          // Details
                                          Expanded(
                                            child: Padding(
                                              padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Row(
                                                        children: [
                                                          Text(
                                                            isFree ? tr('common_free') : '$price $currency',
                                                            style: TextStyle(
                                                              fontWeight: FontWeight.w900,
                                                              fontSize: 13,
                                                              color: hasPromo
                                                                  ? (isDark ? const Color(0xFF4ADE80) : const Color(0xFF16A34A))
                                                                  : (isDark
                                                                      ? const Color(0xFF2DD4BF)
                                                                      : const Color(0xFF002F34)),
                                                            ),
                                                            maxLines: 1,
                                                            overflow: TextOverflow.ellipsis,
                                                          ),
                                                          if (hasPromo) ...[
                                                            const SizedBox(width: 4),
                                                            Expanded(
                                                              child: Text(
                                                                '$origPrice',
                                                                style: TextStyle(
                                                                  fontSize: 10,
                                                                  color: isDark ? const Color(0xFF94A3B8) : Colors.grey,
                                                                  decoration: TextDecoration.lineThrough,
                                                                ),
                                                                maxLines: 1,
                                                                overflow: TextOverflow.ellipsis,
                                                              ),
                                                            ),
                                                          ],
                                                        ],
                                                      ),
                                                      const SizedBox(height: 2),
                                                      Text(
                                                        title,
                                                        style: TextStyle(
                                                          fontWeight: FontWeight.bold,
                                                          fontSize: 12,
                                                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                                                        ),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                      if (catSlug.isNotEmpty) ...[
                                                        const SizedBox(height: 2),
                                                        Text(
                                                          trCat(catSlug, catName),
                                                          style: TextStyle(
                                                            fontSize: 10,
                                                            fontWeight: FontWeight.w600,
                                                            color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0D9488),
                                                          ),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ],
                                                    ],
                                                  ),
                                                  Row(
                                                    children: [
                                                      Icon(
                                                        Icons.location_on_outlined,
                                                        size: 11,
                                                        color: isDark ? const Color(0xFF94A3B8) : Colors.grey,
                                                      ),
                                                      const SizedBox(width: 2),
                                                      Expanded(
                                                        child: Text(
                                                          location,
                                                          style: TextStyle(
                                                            fontSize: 10,
                                                            color: isDark ? const Color(0xFFCBD5E1) : Colors.grey,
                                                          ),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                                childCount: _ads.length,
                              ),
                            ),
                          ),
              ],
            ),
          ),
        );
      },
    );
  }
}
