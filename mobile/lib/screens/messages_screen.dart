import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../widgets/app_image.dart';
import 'chat_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> _conversations = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final token = await ApiService.getToken();
      if (token == null) {
        setState(() {
          _error = 'Please sign in to view your messages.';
          _loading = false;
        });
        return;
      }

      final convs = await ApiService.getConversations();
      setState(() {
        _conversations = convs;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load conversations.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Messages',
          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34)),
        ),
        backgroundColor: Colors.white,
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
                          Text(_error!, style: const TextStyle(color: Colors.grey)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _fetchConversations,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF002F34),
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _conversations.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.mark_chat_unread_outlined, size: 64, color: Colors.grey),
                            SizedBox(height: 12),
                            Text(
                              'No conversations yet',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF002F34)),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'When you contact a seller, your chat appears here.',
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: _conversations.length,
                        separatorBuilder: (context, index) => const Divider(height: 1, indent: 80),
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
                                color: Colors.grey.shade100,
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
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
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
                                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
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
  }
}
