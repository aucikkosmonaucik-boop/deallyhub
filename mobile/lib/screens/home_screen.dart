import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../widgets/app_image.dart';
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
    _loadInitialData();
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
            willBeSaved ? 'Added to Saved Items!' : 'Removed from Saved Items',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),

      // Hamburger Drawer with all 25 Categories
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: Column(
          children: [
            // Drawer Header
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Color(0xFF002F34),
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
                        'Categories (${_categories.length})',
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
              leading: const Icon(Icons.grid_view_rounded, color: Color(0xFF002F34)),
              title: const Text(
                'All Categories',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              trailing: _selectedCategory == null
                  ? const Icon(Icons.check, color: Color(0xFF0D9488), size: 18)
                  : null,
              selected: _selectedCategory == null,
              selectedTileColor: const Color(0xFFF0FDFA),
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
                  final name = cat['name'] as String;
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
                        color: isSelected ? const Color(0xFF002F34) : const Color(0xFF374151),
                      ),
                    ),
                    trailing: isSelected
                        ? const Icon(Icons.check, color: Color(0xFF0D9488), size: 16)
                        : null,
                    selected: isSelected,
                    selectedTileColor: const Color(0xFFF0FDFA),
                    onTap: () => _selectCategory(slug, name),
                  );
                },
              ),
            ),
          ],
        ),
      ),

      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Color(0xFF002F34), size: 26),
            tooltip: 'Browse Categories',
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: Row(
          children: [
            RichText(
              text: const TextSpan(
                text: 'Deally',
                style: TextStyle(color: Color(0xFF002F34), fontWeight: FontWeight.w900, fontSize: 22),
                children: [
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
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF002F34), size: 20),
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
            // Compact Search Bar Header
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(14, 4, 14, 10),
                child: Column(
                  children: [
                    Row(
                      children: [
                        // Keyword search field
                        Expanded(
                          flex: 3,
                          child: Container(
                            height: 42,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: TextField(
                              controller: _searchController,
                              style: const TextStyle(fontSize: 13),
                              decoration: InputDecoration(
                                hintText: 'Search offers...',
                                hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                                prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 18),
                                suffixIcon: _searchController.text.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(Icons.clear, size: 15),
                                        onPressed: () {
                                          _searchController.clear();
                                          _fetchAds();
                                        },
                                      )
                                    : null,
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              onSubmitted: (_) => _fetchAds(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),

                        // Location field
                        Expanded(
                          flex: 2,
                          child: Container(
                            height: 42,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: TextField(
                              controller: _locationController,
                              style: const TextStyle(fontSize: 13),
                              decoration: const InputDecoration(
                                hintText: 'City...',
                                hintStyle: TextStyle(fontSize: 12, color: Colors.grey),
                                prefixIcon: Icon(Icons.location_on_outlined, color: Colors.grey, size: 16),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(vertical: 10),
                              ),
                              onSubmitted: (_) => _fetchAds(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),

                        // Search submit button
                        SizedBox(
                          height: 42,
                          width: 44,
                          child: ElevatedButton(
                            onPressed: _fetchAds,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF002F34),
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Icon(Icons.search, size: 20),
                          ),
                        ),
                      ],
                    ),

                    // Active Category Filter Indicator Chip
                    if (_selectedCategory != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDFA),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF0D9488)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  _selectedCategoryName ?? _selectedCategory!,
                                  style: const TextStyle(
                                    color: Color(0xFF0D9488),
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
                                  child: const Icon(Icons.close, size: 13, color: Color(0xFF0D9488)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
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
                              const Text(
                                'No advertisements found',
                                style: TextStyle(color: Color(0xFF002F34), fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Pull down or tap below to refresh',
                                style: TextStyle(color: Colors.grey, fontSize: 13),
                              ),
                              const SizedBox(height: 14),
                              ElevatedButton.icon(
                                onPressed: _loadInitialData,
                                icon: const Icon(Icons.refresh, size: 18),
                                label: const Text('Refresh'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF002F34),
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
                              final isFree = (double.tryParse('$price') ?? 0) == 0;

                              return Card(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  side: const BorderSide(color: Color(0xFFE5E7EB)),
                                ),
                                elevation: 0,
                                clipBehavior: Clip.antiAlias,
                                color: Colors.white,
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
                                              color: Colors.grey.shade100,
                                              child: AppImage(
                                                imageUrl: cover,
                                                fit: BoxFit.cover,
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
                                                decoration: const BoxDecoration(
                                                  color: Color(0xE6FFFFFF),
                                                  shape: BoxShape.circle,
                                                  boxShadow: [
                                                    BoxShadow(color: Colors.black12, blurRadius: 4),
                                                  ],
                                                ),
                                                child: Center(
                                                  child: Icon(
                                                    isSaved ? Icons.favorite : Icons.favorite_border,
                                                    size: 18,
                                                    color: isSaved ? Colors.redAccent : Colors.grey.shade600,
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
                                                  Text(
                                                    isFree ? 'Free' : '$price $currency',
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.w900,
                                                      fontSize: 14,
                                                      color: Color(0xFF002F34),
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    title,
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 12,
                                                      color: Color(0xFF1F2937),
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ],
                                              ),
                                              Row(
                                                children: [
                                                  const Icon(Icons.location_on_outlined, size: 11, color: Colors.grey),
                                                  const SizedBox(width: 2),
                                                  Expanded(
                                                    child: Text(
                                                      location,
                                                      style: const TextStyle(fontSize: 10, color: Colors.grey),
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
  }
}
