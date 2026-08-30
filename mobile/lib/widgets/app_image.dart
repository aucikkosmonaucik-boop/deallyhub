import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';

class AppImage extends StatelessWidget {
  final String? imageUrl;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget? placeholder;
  final Widget? errorWidget;

  const AppImage({
    super.key,
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.placeholder,
    this.errorWidget,
  });

  // In-memory cache for decoded base64 images so we decode each only once
  // and maintain object identity for Flutter's PaintingBinding.imageCache.
  static final Map<String, Uint8List> _base64Cache = {};
  static const int _maxBase64CacheSize = 100;

  static Uint8List? _decodeBase64(String raw) {
    if (_base64Cache.containsKey(raw)) {
      return _base64Cache[raw];
    }
    try {
      final commaIndex = raw.indexOf(',');
      final base64String = commaIndex != -1 ? raw.substring(commaIndex + 1) : raw;
      final cleanBase64 = base64String.replaceAll(RegExp(r'\s+'), '');
      final Uint8List bytes = base64Decode(cleanBase64);
      if (_base64Cache.length >= _maxBase64CacheSize) {
        _base64Cache.remove(_base64Cache.keys.first);
      }
      _base64Cache[raw] = bytes;
      return bytes;
    } catch (_) {
      return null;
    }
  }

  /// Returns an [ImageProvider] for the given [imageUrl], whether it is base64 or network URL.
  static ImageProvider? getImageProvider(String? imageUrl) {
    if (imageUrl == null || imageUrl.trim().isEmpty) return null;
    final trimmed = imageUrl.trim();
    if (trimmed.startsWith('data:image/') ||
        (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && trimmed.length > 100)) {
      final bytes = _decodeBase64(trimmed);
      if (bytes != null) {
        return MemoryImage(bytes);
      }
      return null;
    }
    return NetworkImage(trimmed);
  }

  /// Pre-caches an image in Flutter's memory/GPU cache.
  static void precache(BuildContext context, String? imageUrl) {
    final provider = getImageProvider(imageUrl);
    if (provider != null) {
      precacheImage(
        provider,
        context,
        onError: (exception, stackTrace) {
          // Gracefully suppress network/precache errors (e.g. offline, 404)
        },
      ).catchError((_) {});
    }
  }

  /// Pre-caches a collection of images in Flutter's memory/GPU cache.
  static void precacheAll(BuildContext context, Iterable<String> imageUrls) {
    for (final url in imageUrls) {
      precache(context, url);
    }
  }

  @override
  Widget build(BuildContext context) {
    final defaultError = errorWidget ??
        Center(
          child: Icon(Icons.image_outlined, color: Colors.grey.shade400, size: 28),
        );

    if (imageUrl == null || imageUrl!.trim().isEmpty) {
      return defaultError;
    }

    final trimmed = imageUrl!.trim();

    // Check if it's a data URI or raw base64 string
    if (trimmed.startsWith('data:image/') ||
        (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && trimmed.length > 100)) {
      final bytes = _decodeBase64(trimmed);
      if (bytes == null) {
        return defaultError;
      }

      return Image.memory(
        bytes,
        width: width,
        height: height,
        fit: fit,
        gaplessPlayback: true,
        errorBuilder: (context, error, stackTrace) => defaultError,
        frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
          if (wasSynchronouslyLoaded) return child;
          return AnimatedOpacity(
            opacity: frame == null ? 0.0 : 1.0,
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOut,
            child: child,
          );
        },
      );
    }

    // Standard HTTP / HTTPS URL
    return Image.network(
      trimmed,
      width: width,
      height: height,
      fit: fit,
      gaplessPlayback: true,
      errorBuilder: (context, error, stackTrace) => defaultError,
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        if (wasSynchronouslyLoaded) return child;
        return AnimatedOpacity(
          opacity: frame == null ? 0.0 : 1.0,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
          child: child,
        );
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder ??
            Center(
              child: SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: const Color(0xFF0D9488),
                  value: loadingProgress.expectedTotalBytes != null
                      ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                      : null,
                ),
              ),
            );
      },
    );
  }
}
