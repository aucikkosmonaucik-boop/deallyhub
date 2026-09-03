import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';
import '../widgets/app_image.dart';
import 'chat_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  static List<dynamic> _cachedConversations = [];

  List<dynamic> _conversations = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (_cachedConversations.isNotEmpty) {
      _conversations = _cachedConversations;
      _loading = false;
    }
    _fetchConversations(silent: _conversations.isNotEmpty);
  }

  Future<void> _fetchConversations({bool silent = false}) async {
    if (!silent && _conversations.isEmpty) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }

    try {
      final token = await ApiService.getToken();
      if (token == null) {
        if (mounted) {
          setState(() {
            _error = tr('post_req_auth');
            _loading = false;
          });
        }
        return;
      }

      final convs = await ApiService.getConversations();
      _cachedConversations = convs;
      if (mounted) {
        setState(() {
          _conversations = convs;
          _loading = false;
          _error = null;
        });
      }
    } catch (e) {
      if (mounted && _conversations.isEmpty) {
        setState(() {
          _error = 'Failed to load conversations.';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: LanguageController.instance,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          appBar: AppBar(
            title: Text(
              tr('messages_title'),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            backgroundColor: Theme.of(context).colorScheme.surface,
            elevation: 0,
          ),
          body: RefreshIndicator(
            color: const Color(0xFF0D9488),
            onRefresh: _fetchConversations,
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
                : _error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.chat_bubble_outline, size: 64, color: Colors.grey),
                              const SizedBox(height: 12),
                              Text(_error!, style: const TextStyle(color: Colors.grey), textAlign: TextAlign.center),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: _fetchConversations,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Theme.of(context).brightness == Brightness.dark
                                      ? const Color(0xFF0D9488)
                                      : const Color(0xFF002F34),
                                  foregroundColor: Colors.white,
                                ),
                                child: Text(tr('common_retry')),
                              ),
                            ],
                          ),
                        ),
                      )
                    : _conversations.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.mark_chat_unread_outlined, size: 64, color: Colors.grey),
                                const SizedBox(height: 12),
                                Text(
                                  tr('messages_empty'),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: Theme.of(context).colorScheme.onSurface,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  tr('messages_empty_desc'),
                                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: _conversations.length,
                            separatorBuilder: (context, index) => Divider(
                              height: 1,
                              indent: 80,
                              color: Theme.of(context).dividerColor,
                            ),
                            itemBuilder: (ctx, idx) {
                              final c = _conversations[idx];
                              final otherName = c['other_user_name'] ?? 'User';
                              final adTitle = c['ad_title'] ?? '';
                              final adPrice = '${c['ad_price']} ${c['ad_currency']}';
                              final lastMsg = c['last_message'] ?? '';
                              final imgUrl = c['ad_image'];

                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                                leading: ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Container(
                                    width: 52,
                                    height: 52,
                                    color: Theme.of(context).brightness == Brightness.dark
                                        ? const Color(0xFF1E293B)
                                        : Colors.grey.shade100,
                                    child: AppImage(
                                      imageUrl: imgUrl,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                title: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        otherName,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          color: Theme.of(context).colorScheme.onSurface,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 2),
                                    Text(
                                      '$adTitle • $adPrice',
                                      style: const TextStyle(color: Color(0xFF0D9488), fontSize: 12, fontWeight: FontWeight.w600),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      lastMsg,
                                      style: TextStyle(
                                        color: Theme.of(context).brightness == Brightness.dark
                                            ? const Color(0xFF94A3B8)
                                            : Colors.grey[600],
                                        fontSize: 13,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ChatScreen(
                                        conversationId: c['id'] as int,
                                        otherUserName: otherName,
                                        adTitle: adTitle,
                                        adPrice: adPrice,
                                      ),
                                    ),
                                  ).then((_) => _fetchConversations());
                                },
                              );
                            },
                          ),
          ),
        );
      },
    );
  }
}
