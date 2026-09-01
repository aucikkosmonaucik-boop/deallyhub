import 'dart:async';
import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';
import '../utils/content_filter.dart';

class ChatScreen extends StatefulWidget {
  final int conversationId;
  final String otherUserName;
  final String adTitle;
  final String adPrice;

  const ChatScreen({
    super.key,
    required this.conversationId,
    required this.otherUserName,
    required this.adTitle,
    required this.adPrice,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final List<dynamic> _messages = [];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _loading = true;
  bool _sending = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) => _fetchMessages(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final msgs = await ApiService.getMessages(widget.conversationId);
      if (!mounted) return;
      setState(() {
        _messages.clear();
        _messages.addAll(msgs);
        if (!silent) _loading = false;
      });
      _scrollToBottom();
    } catch (_) {
      if (!silent && mounted) setState(() => _loading = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;

    if (AppContentFilter.containsProfanity(text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFDC2626),
          content: Text(tr('error_profanity')),
        ),
      );
      return;
    }

    _controller.clear();
    setState(() => _sending = true);

    try {
      final res = await ApiService.sendMessage(widget.conversationId, text);
      if (res['success'] == true && res['message'] != null) {
        setState(() {
          _messages.add(res['message']);
        });
        _scrollToBottom();
      } else {
        final err = res['error']?.toString() ?? '';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFFDC2626),
              content: Text(err.contains('prohibited') || err.contains('offensive')
                  ? tr('error_profanity')
                  : err),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: Theme.of(context).colorScheme.onSurface, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.otherUserName,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            Text(
              '${widget.adTitle} • ${widget.adPrice}',
              style: const TextStyle(color: Color(0xFF0D9488), fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages Stream
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
                : _messages.isEmpty
                    ? Center(
                        child: Text(
                          tr('messages_empty'),
                          style: TextStyle(color: isDark ? const Color(0xFF94A3B8) : Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (ctx, idx) {
                          final m = _messages[idx];
                          final isMine = m['is_mine'] == true;
                          final content = AppContentFilter.censorProfanity(m['content']?.toString() ?? '');

                          return Align(
                            alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              constraints: BoxConstraints(
                                maxWidth: MediaQuery.of(context).size.width * 0.75,
                              ),
                              decoration: BoxDecoration(
                                color: isMine
                                    ? (isDark ? const Color(0xFF0D9488) : const Color(0xFF002F34))
                                    : (isDark ? const Color(0xFF1E293B) : Colors.white),
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(16),
                                  topRight: const Radius.circular(16),
                                  bottomLeft: Radius.circular(isMine ? 16 : 4),
                                  bottomRight: Radius.circular(isMine ? 4 : 16),
                                ),
                                border: isMine
                                    ? null
                                    : Border.all(
                                        color: isDark ? const Color(0xFF334155) : Colors.grey.shade200,
                                      ),
                                boxShadow: const [
                                  BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1)),
                                ],
                              ),
                              child: Text(
                                content,
                                style: TextStyle(
                                  color: isMine
                                      ? Colors.white
                                      : (isDark ? Colors.white : const Color(0xFF002F34)),
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      textCapitalization: TextCapitalization.sentences,
                      style: TextStyle(
                        fontSize: 14,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                      decoration: InputDecoration(
                        hintText: tr('messages_placeholder'),
                        hintStyle: TextStyle(
                          fontSize: 14,
                          color: isDark ? const Color(0xFF94A3B8) : Colors.grey,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF3F4F6),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: _sending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0D9488)),
                          )
                        : Icon(
                            Icons.send_rounded,
                            color: isDark ? const Color(0xFF2DD4BF) : const Color(0xFF002F34),
                          ),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
