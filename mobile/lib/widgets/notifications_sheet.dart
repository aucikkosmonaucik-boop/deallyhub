import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';

class NotificationsSheet {
  static void show(BuildContext context, {VoidCallback? onStateChanged}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    List<dynamic>? cachedNotifications;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => DraggableScrollableSheet(
          initialChildSize: 0.8,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollController) => FutureBuilder<List<dynamic>>(
            future: cachedNotifications != null
                ? Future.value(cachedNotifications)
                : ApiService.getNotifications().then((val) {
                    cachedNotifications = val;
                    return val;
                  }),
            builder: (ctx, snapshot) {
              final items = cachedNotifications ?? snapshot.data ?? [];
              final unreadItems = items.where((n) => n['is_read'] != true).toList();
              final readItems = items.where((n) => n['is_read'] == true).toList();

              Widget buildNotificationTile(dynamic n) {
                final isRead = n['is_read'] == true;
                final type = n['type']?.toString() ?? 'system';

                Color iconColor = const Color(0xFF0D9488);
                IconData iconData = Icons.notifications_rounded;
                Color tileBg = isRead
                    ? (isDark ? const Color(0x801E293B) : Colors.white)
                    : (isDark ? const Color(0x59134E4A) : const Color(0xFFF0FDFA));

                if (type == 'alert') {
                  iconColor = Colors.amber.shade700;
                  iconData = Icons.warning_amber_rounded;
                } else if (type == 'promotion') {
                  iconColor = Colors.purple.shade600;
                  iconData = Icons.auto_awesome_rounded;
                } else if (type == 'system') {
                  iconColor = const Color(0xFF0D9488);
                  iconData = Icons.verified_user_rounded;
                } else {
                  iconColor = Colors.blue.shade600;
                  iconData = Icons.info_outline_rounded;
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: tileBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isRead
                          ? (isDark ? const Color(0xFF334155) : Colors.grey.shade200)
                          : (isDark ? const Color(0x800D9488) : const Color(0xFF99F6E4)),
                    ),
                  ),
                  child: ListTile(
                    onTap: () async {
                      if (!isRead && n['id'] != null) {
                        setModalState(() {
                          n['is_read'] = true;
                        });
                        await ApiService.markNotificationRead(n['id'] as int);
                        onStateChanged?.call();
                      }
                    },
                    contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
                    leading: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: isRead
                            ? (isDark ? const Color(0xFF334155) : Colors.grey.shade100)
                            : (isDark ? const Color(0xFF134E4A) : const Color(0xFFCCFBF1)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(iconData, size: 20, color: iconColor),
                    ),
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            n['title'] ?? '',
                            style: TextStyle(
                              fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                              fontSize: 14,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (!isRead) ...[
                              Container(
                                margin: const EdgeInsets.only(left: 6),
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0D9488),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'NEW',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                            ],
                            GestureDetector(
                              onTap: () async {
                                if (n['id'] != null) {
                                  final notifId = n['id'] as int;
                                  setModalState(() {
                                    items.removeWhere((it) => it['id'] == notifId);
                                  });
                                  await ApiService.deleteNotification(notifId);
                                  onStateChanged?.call();
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF334155) : Colors.grey.shade200,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.close_rounded,
                                  size: 14,
                                  color: isDark ? Colors.white70 : Colors.grey.shade700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        n['message'] ?? '',
                        style: TextStyle(
                          fontSize: 12,
                          height: 1.35,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  ),
                );
              }

              return Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: Theme.of(context).dividerColor)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.notifications_active_rounded, color: Color(0xFF0D9488)),
                            const SizedBox(width: 8),
                            Text(
                              tr('notif_title'),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            if (items.isNotEmpty) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF334155) : Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${items.length}',
                                  style: TextStyle(
                                    color: isDark ? Colors.white70 : Colors.grey.shade800,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                            if (unreadItems.isNotEmpty) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade600,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${unreadItems.length}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        if (unreadItems.isNotEmpty)
                          TextButton.icon(
                            onPressed: () async {
                              setModalState(() {
                                for (var it in items) {
                                  it['is_read'] = true;
                                }
                              });
                              await ApiService.markAllNotificationsRead();
                              onStateChanged?.call();
                            },
                            icon: const Icon(Icons.done_all_rounded, size: 16, color: Color(0xFF0D9488)),
                            label: Text(
                              tr('notif_mark_all_read'),
                              style: const TextStyle(
                                color: Color(0xFF0D9488),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  Expanded(
                    child: snapshot.connectionState == ConnectionState.waiting && cachedNotifications == null
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
                        : items.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.notifications_none, size: 48, color: Colors.grey),
                                    const SizedBox(height: 12),
                                    Text(
                                      tr('notif_empty_all'),
                                      style: TextStyle(
                                        color: isDark ? const Color(0xFF94A3B8) : Colors.grey,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView(
                                controller: scrollController,
                                padding: const EdgeInsets.all(16),
                                children: [
                                  if (unreadItems.isNotEmpty) ...[
                                    Row(
                                      children: [
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF0D9488),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '${tr('notif_new_section')} (${unreadItems.length})',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF0D9488),
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    ...unreadItems.map((n) => buildNotificationTile(n)),
                                    const SizedBox(height: 12),
                                  ],
                                  if (readItems.isNotEmpty) ...[
                                    if (unreadItems.isNotEmpty) ...[
                                      Row(
                                        children: [
                                          const Icon(Icons.done_all_rounded, size: 14, color: Colors.grey),
                                          const SizedBox(width: 6),
                                          Text(
                                            '${tr('notif_earlier_section')} (${readItems.length})',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                    ],
                                    ...readItems.map((n) => buildNotificationTile(n)),
                                  ],
                                ],
                              ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
