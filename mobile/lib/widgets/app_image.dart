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
      try {
        final commaIndex = trimmed.indexOf(',');
        final base64String = commaIndex != -1 ? trimmed.substring(commaIndex + 1) : trimmed;
        final cleanBase64 = base64String.replaceAll(RegExp(r'\s+'), '');
        final Uint8List bytes = base64Decode(cleanBase64);

        return Image.memory(
          bytes,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (context, error, stackTrace) => defaultError,
        );
      } catch (e) {
        return defaultError;
      }
    }

    // Standard HTTP / HTTPS URL
    return Image.network(
      trimmed,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => defaultError,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder ??
            Center(
              child: SizedBox(
                width: 20,
                height: 20,
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
