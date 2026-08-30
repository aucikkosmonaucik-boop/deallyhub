import 'package:flutter/material.dart';
import '../l10n/app_translations.dart';
import '../l10n/language_controller.dart';

class LanguagePickerDialog {
  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final currentCode = LanguageController.instance.languageCode;

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.language_rounded, color: Color(0xFF0D9488), size: 24),
                          const SizedBox(width: 10),
                          Text(
                            tr('lang_picker_title', 'Select Language'),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF002F34),
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),

                // Language List
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: AppTranslations.supportedLanguages.length,
                    separatorBuilder: (_, _) => const Divider(height: 1, indent: 64),
                    itemBuilder: (context, idx) {
                      final lang = AppTranslations.supportedLanguages[idx];
                      final code = lang['code']!;
                      final isSelected = code == currentCode;

                      return ListTile(
                        leading: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFF0FDFA) : const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF0D9488) : Colors.transparent,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            lang['flag'] ?? '',
                            style: const TextStyle(fontSize: 22),
                          ),
                        ),
                        title: Text(
                          lang['native'] ?? '',
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                            color: isSelected ? const Color(0xFF0D9488) : const Color(0xFF002F34),
                            fontSize: 15,
                          ),
                        ),
                        subtitle: Text(
                          lang['name'] ?? '',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle_rounded, color: Color(0xFF0D9488))
                            : null,
                        onTap: () {
                          LanguageController.instance.setLanguage(code);
                          Navigator.pop(ctx);
                        },
                      );
                    },
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
