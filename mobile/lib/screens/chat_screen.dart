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
  static final Map<int, List<dynamic>> _cachedMessages = {};

  final List<dynamic> _messages = [];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _loading = true;
  bool _sending = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Use cached messages immediately if available to eliminate spinner flicker
    if (_cachedMessages.containsKey(widget.conversationId) &&
        _cachedMessages[widget.conversationId]!.isNotEmpty) {
      _messages.addAll(_cachedMessages[widget.conversationId]!);
      _loading = false;
    }
    _fetchMessages(silent: _messages.isNotEmpty);
    _timer = Timer.periodic(const Duration(seconds: 4), (_) => _fetchMessages(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages({bool silent = false}) async {
    if (!silent && _messages.isEmpty) {
      setState(() => _loading = true);
    }
    try {
      final msgs = await ApiService.getMessages(widget.conversationId);
      if (!mounted) return;

      _cachedMessages[widget.conversationId] = msgs;

      // Only update state and scroll if messages have actually changed
      final hasChanged = _messages.length != msgs.length ||
          (_messages.isNotEmpty && msgs.isNotEmpty && _messages.last['id'] != msgs.last['id']);

      if (hasChanged || (!silent && _loading)) {
        setState(() {
          _messages.clear();
          _messages.addAll(msgs);
          _loading = false;
        });

        if (hasChanged) {
          _scrollToBottom();
        }
      }
    } catch (_) {
      if (!silent && mounted && _messages.isEmpty) {
        setState(() => _loading = false);
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
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
        if (mounted) {
          setState(() {
            _messages.add(res['message']);
          });
          _scrollToBottom();
        }
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
    final isKeyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      resizeToAvoidBottomInset: true,
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
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: Column(
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
                          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: _messages.length,
                          itemBuilder: (ctx, idx) {
                            final m = _messages[idx];
                            final isMine = m['is_mine'] == true;
                            final content = AppContentFilter.censorProfanity(m['content']?.toString() ?? '');

                            return RepaintBoundary(
                              key: ValueKey(m['id'] ?? idx),
                              child: Align(
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
                              ),
                            );
                          },
                        ),
            ),

            // Message Input Field - Stable & Fixed Alignment
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 4,
                    offset: const Offset(0, -1),
                  ),
                ],
              ),
              child: SafeArea(
                top: false,
                bottom: !isKeyboardOpen,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: isDark ? const Color(0xFF334155) : Colors.grey.shade300,
                              width: 1,
                            ),
                          ),
                          child: TextField(
                            controller: _controller,
                            minLines: 1,
                            maxLines: 4,
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
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            onSubmitted: (_) => _sendMessage(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Material(
                          color: isDark ? const Color(0xFF0D9488) : const Color(0xFF002F34),
                          shape: const CircleBorder(),
                          child: InkWell(
                            customBorder: const CircleBorder(),
                            onTap: _sending ? null : _sendMessage,
                            child: Padding(
                              padding: const EdgeInsets.all(10),
                              child: _sending
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(
                                      Icons.send_rounded,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
