import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';
import '../widgets/app_image.dart';
import 'chat_screen.dart';

class AdDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> ad;
  final bool initialSaved;
  final VoidCallback? onSavedChanged;

  const AdDetailsScreen({
    super.key,
    required this.ad,
    this.initialSaved = false,
    this.onSavedChanged,
  });

  @override
  State<AdDetailsScreen> createState() => _AdDetailsScreenState();
}

class _AdDetailsScreenState extends State<AdDetailsScreen> {
  late bool _isSaved;
  late final ValueNotifier<int> _selectedImageNotifier;
  late final PageController _pageController;
  bool _precached = false;
  bool _startingChat = false;

  @override
  void initState() {
    super.initState();
    _isSaved = widget.initialSaved;
    _selectedImageNotifier = ValueNotifier<int>(0);
    _pageController = PageController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_precached) {
      _precached = true;
      final images = (widget.ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
      if (images.isNotEmpty) {
        AppImage.precacheAll(context, images);
      }
    }
  }

  @override
  void dispose() {
    _selectedImageNotifier.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _toggleSaved() async {
    final adId = widget.ad['id'] as int;
    final willBeSaved = !_isSaved;
    setState(() => _isSaved = willBeSaved);
    final newState = await ApiService.toggleSavedAd(adId, widget.ad);
    if (mounted && newState != willBeSaved) {
      setState(() => _isSaved = newState);
    }
    widget.onSavedChanged?.call();
  }

  Future<void> _callSeller(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _emailSeller(String email, String title) async {
    final uri = Uri.parse('mailto:$email?subject=Deallyhub: $title');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _startChat() async {
    setState(() => _startingChat = true);
    try {
      final res = await ApiService.startConversation(widget.ad['id'] as int);
      if (!mounted) return;
      if (res['success'] == true && res['conversation'] != null) {
        final conv = res['conversation'];
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ChatScreen(
              conversationId: conv['id'] as int,
              otherUserName: widget.ad['author_name'] ?? 'Seller',
              adTitle: widget.ad['title'] ?? '',
              adPrice: '${widget.ad['price']} ${widget.ad['currency']}',
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res['error'] ?? 'Could not start chat')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _startingChat = false);
    }
  }

  void _openFullScreenGallery(BuildContext context, List<String> images, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FullScreenGalleryView(images: images, initialIndex: initialIndex),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final images = (widget.ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
    final title = widget.ad['title'] ?? 'Advertisement';
    final price = widget.ad['price'] ?? 0;
    final currency = widget.ad['currency'] ?? 'USD';
    final location = widget.ad['location'] ?? 'Entire Country';
    final description = widget.ad['description'] ?? '';
    final phone = widget.ad['phone'] ?? '';
    final authorName = widget.ad['author_name'] ?? 'Verified Seller';
    final authorEmail = widget.ad['author_email'] ?? '';
    final isFree = (double.tryParse('$price') ?? 0) == 0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF002F34), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _isSaved ? Icons.favorite : Icons.favorite_border,
              color: _isSaved ? Colors.redAccent : const Color(0xFF002F34),
            ),
            onPressed: _toggleSaved,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Photos Carousel
            if (images.isNotEmpty)
              SizedBox(
                height: 280,
                child: Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    PageView.builder(
                      controller: _pageController,
                      physics: const BouncingScrollPhysics(),
                      itemCount: images.length,
                      onPageChanged: (idx) => _selectedImageNotifier.value = idx,
                      itemBuilder: (ctx, idx) {
                        return _KeepAliveImagePage(
                          child: GestureDetector(
                            onTap: () => _openFullScreenGallery(context, images, idx),
                            child: Container(
                              color: const Color(0xFFF2F4F5),
                              child: AppImage(
                                imageUrl: images[idx],
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    if (images.length > 1)
                      Positioned(
                        bottom: 12,
                        child: ValueListenableBuilder<int>(
                          valueListenable: _selectedImageNotifier,
                          builder: (context, currentIndex, _) {
                            return Row(
                              children: List.generate(
                                images.length,
                                (i) => AnimatedContainer(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  width: currentIndex == i ? 18 : 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: currentIndex == i
                                        ? const Color(0xFF002F34)
                                        : Colors.black26,
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    if (images.length > 1)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: ValueListenableBuilder<int>(
                          valueListenable: _selectedImageNotifier,
                          builder: (context, currentIndex, _) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '${currentIndex + 1} / ${images.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      // Tap to zoom hint badge
                      Positioned(
                        bottom: 12,
                        right: 12,
                        child: GestureDetector(
                          onTap: () => _openFullScreenGallery(
                            context,
                            images,
                            _selectedImageNotifier.value,
                          ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                            decoration: BoxDecoration(
                              color: const Color(0xB3000000),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.white24, width: 0.8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.zoom_in, color: Colors.white, size: 15),
                                const SizedBox(width: 4),
                                Text(
                                  tr('details_zoom_hint'),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              )
            else
              Container(
                height: 200,
                color: const Color(0xFFF2F4F5),
                child: const Center(
                  child: Icon(Icons.image_outlined, size: 64, color: Colors.grey),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Badge
                  Builder(
                    builder: (context) {
                      final catSlug = (widget.ad['category_slug'] ?? widget.ad['category'] ?? '').toString();
                      final catName = (widget.ad['category_name'] ?? widget.ad['category'] ?? '').toString();
                      if (catSlug.isEmpty) return const SizedBox.shrink();
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF002F34),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          trCat(catSlug, catName),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      );
                    },
                  ),

                  // Price Tag
                  Text(
                    isFree ? tr('common_free') : '$price $currency',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF002F34),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Title
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF002F34),
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Location & Category info
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        location,
                        style: const TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                    ],
                  ),
                  const Divider(height: 32),

                  // Description
                  Text(
                    tr('details_desc'),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF002F34),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF374151),
                      height: 1.5,
                    ),
                  ),
                  const Divider(height: 36),

                  // Seller Info Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: const Color(0xFF0D9488),
                              child: Text(
                                authorName.isNotEmpty ? authorName[0].toUpperCase() : 'S',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    authorName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Color(0xFF002F34),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      const Icon(Icons.verified, size: 14, color: Color(0xFF0D9488)),
                                      const SizedBox(width: 4),
                                      Text(
                                        tr('details_verified_member'),
                                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Chat with Seller Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _startingChat ? null : _startChat,
                            icon: _startingChat
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.chat_bubble_outline, size: 18),
                            label: Text(
                              tr('details_chat'),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0D9488),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),

                        // Phone Button
                        if (phone.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () => _callSeller(phone),
                              icon: const Icon(Icons.phone_outlined, size: 18),
                              label: Text('${tr("details_call")}: $phone'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF002F34),
                                side: const BorderSide(color: Color(0xFF002F34)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        ],

                        // Email Button
                        if (authorEmail.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () => _emailSeller(authorEmail, title),
                              icon: const Icon(Icons.mail_outline, size: 18),
                              label: Text(tr('details_email')),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.grey[800],
                                side: const BorderSide(color: Color(0xFFE5E7EB)),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Safety Tips Banner
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFCCFBF1)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.shield_outlined, size: 18, color: Color(0xFF0D9488)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            tr('details_safety_tips'),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF134E4A),
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // System navigation bar buffer / Safe bottom inset
                  SizedBox(height: 16 + MediaQuery.paddingOf(context).bottom),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KeepAliveImagePage extends StatefulWidget {
  final Widget child;
  const _KeepAliveImagePage({required this.child});

  @override
  State<_KeepAliveImagePage> createState() => _KeepAliveImagePageState();
}

class _KeepAliveImagePageState extends State<_KeepAliveImagePage> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return widget.child;
  }
}

class _FullScreenGalleryView extends StatefulWidget {
  final List<String> images;
  final int initialIndex;

  const _FullScreenGalleryView({
    required this.images,
    required this.initialIndex,
  });

  @override
  State<_FullScreenGalleryView> createState() => _FullScreenGalleryViewState();
}

class _FullScreenGalleryViewState extends State<_FullScreenGalleryView>
    with TickerProviderStateMixin {
  late final PageController _pageController;
  late final ValueNotifier<int> _currentIndex;
  late final ValueNotifier<bool> _isZoomed;
  late final ValueNotifier<double> _currentScale;
  late final List<TransformationController> _controllers;
  AnimationController? _animController;
  Animation<Matrix4>? _matrixAnimation;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: widget.initialIndex);
    _currentIndex = ValueNotifier<int>(widget.initialIndex);
    _isZoomed = ValueNotifier<bool>(false);
    _currentScale = ValueNotifier<double>(1.0);
    _controllers = List.generate(
      widget.images.length,
      (index) {
        final ctrl = TransformationController();
        ctrl.addListener(() => _onTransformChanged(index));
        return ctrl;
      },
    );
  }

  void _onTransformChanged(int index) {
    if (index != _currentIndex.value) return;
    final scale = _controllers[index].value.getMaxScaleOnAxis();
    _currentScale.value = scale;
    final zoomed = scale > 1.05;
    if (_isZoomed.value != zoomed) {
      _isZoomed.value = zoomed;
    }
  }

  void _animateToMatrix(int index, Matrix4 target) {
    final controller = _controllers[index];
    _animController?.stop();
    _animController?.dispose();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 240),
    );

    _matrixAnimation = Matrix4Tween(
      begin: controller.value,
      end: target,
    ).animate(CurvedAnimation(
      parent: _animController!,
      curve: Curves.easeOutCubic,
    ));

    _animController!.addListener(() {
      if (_matrixAnimation != null) {
        controller.value = _matrixAnimation!.value;
      }
    });
    _animController!.forward(from: 0);
  }

  void _zoomIn() {
    final idx = _currentIndex.value;
    final controller = _controllers[idx];
    final current = controller.value.getMaxScaleOnAxis();
    final next = (current + 0.6).clamp(1.0, 4.5);
    final size = MediaQuery.of(context).size;
    final cx = size.width / 2;
    final cy = size.height / 2;
    final target = Matrix4.translationValues(cx, cy, 0.0)
      ..multiply(Matrix4.diagonal3Values(next, next, 1.0))
      ..multiply(Matrix4.translationValues(-cx, -cy, 0.0));
    _animateToMatrix(idx, target);
  }

  void _zoomOut() {
    final idx = _currentIndex.value;
    final controller = _controllers[idx];
    final current = controller.value.getMaxScaleOnAxis();
    final next = (current - 0.6).clamp(1.0, 4.5);
    if (next <= 1.05) {
      _animateToMatrix(idx, Matrix4.identity());
    } else {
      final size = MediaQuery.of(context).size;
      final cx = size.width / 2;
      final cy = size.height / 2;
      final target = Matrix4.translationValues(cx, cy, 0.0)
        ..multiply(Matrix4.diagonal3Values(next, next, 1.0))
        ..multiply(Matrix4.translationValues(-cx, -cy, 0.0));
      _animateToMatrix(idx, target);
    }
  }

  void _resetZoom() {
    final idx = _currentIndex.value;
    _animateToMatrix(idx, Matrix4.identity());
  }

  void _onDoubleTap(TapDownDetails details, int index) {
    final controller = _controllers[index];
    final current = controller.value.getMaxScaleOnAxis();
    if (current > 1.05) {
      _animateToMatrix(index, Matrix4.identity());
    } else {
      const targetScale = 2.5;
      final pos = details.localPosition;
      final target = Matrix4.translationValues(pos.dx, pos.dy, 0.0)
        ..multiply(Matrix4.diagonal3Values(targetScale, targetScale, 1.0))
        ..multiply(Matrix4.translationValues(-pos.dx, -pos.dy, 0.0));
      _animateToMatrix(index, target);
    }
  }

  @override
  void dispose() {
    _animController?.dispose();
    for (final c in _controllers) {
      c.dispose();
    }
    _pageController.dispose();
    _currentIndex.dispose();
    _isZoomed.dispose();
    _currentScale.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          ValueListenableBuilder<bool>(
            valueListenable: _isZoomed,
            builder: (context, isZoomed, _) {
              return PageView.builder(
                controller: _pageController,
                physics: isZoomed
                    ? const NeverScrollableScrollPhysics()
                    : const BouncingScrollPhysics(),
                itemCount: widget.images.length,
                onPageChanged: (idx) {
                  // Reset previous image zoom when swiping away
                  final prevIdx = _currentIndex.value;
                  if (prevIdx != idx && prevIdx < _controllers.length) {
                    _controllers[prevIdx].value = Matrix4.identity();
                  }
                  _currentIndex.value = idx;
                  _onTransformChanged(idx);
                },
                itemBuilder: (context, idx) {
                  TapDownDetails? doubleTapDetails;
                  return GestureDetector(
                    onDoubleTapDown: (d) => doubleTapDetails = d,
                    onDoubleTap: () {
                      if (doubleTapDetails != null) {
                        _onDoubleTap(doubleTapDetails!, idx);
                      }
                    },
                    child: InteractiveViewer(
                      transformationController: _controllers[idx],
                      minScale: 1.0,
                      maxScale: 4.5,
                      panEnabled: true,
                      scaleEnabled: true,
                      child: Center(
                        child: AppImage(
                          imageUrl: widget.images[idx],
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          ),
          // Top Bar (Close button & counter)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.close, color: Colors.white, size: 24),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  if (widget.images.length > 1)
                    ValueListenableBuilder<int>(
                      valueListenable: _currentIndex,
                      builder: (context, idx, _) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black45,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            '${idx + 1} / ${widget.images.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                    ),
                  const SizedBox(width: 44), // Balance for close button
                ],
              ),
            ),
          ),
          // Floating Bottom Zoom Controls Bar
          Positioned(
            bottom: 24,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xD9000000),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: Colors.white24, width: 1),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black45,
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Zoom Out Button
                      IconButton(
                        icon: const Icon(Icons.remove, color: Colors.white, size: 20),
                        onPressed: _zoomOut,
                        constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                        padding: EdgeInsets.zero,
                        tooltip: 'Zoom Out',
                      ),
                      const SizedBox(width: 4),
                      // Current Zoom % & Reset
                      ValueListenableBuilder<double>(
                        valueListenable: _currentScale,
                        builder: (context, scale, _) {
                          final pct = (scale * 100).round();
                          final isScaled = scale > 1.05;
                          return GestureDetector(
                            onTap: _resetZoom,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: isScaled ? const Color(0xFF002F34) : Colors.white12,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (isScaled) ...[
                                    const Icon(Icons.refresh, color: Colors.tealAccent, size: 13),
                                    const SizedBox(width: 4),
                                  ],
                                  Text(
                                    '$pct%',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 4),
                      // Zoom In Button
                      IconButton(
                        icon: const Icon(Icons.add, color: Colors.white, size: 20),
                        onPressed: _zoomIn,
                        constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                        padding: EdgeInsets.zero,
                        tooltip: 'Zoom In',
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

