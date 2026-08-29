import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_service.dart';
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
  int _selectedImageIndex = 0;
  bool _startingChat = false;

  @override
  void initState() {
    super.initState();
    _isSaved = widget.initialSaved;
  }

  Future<void> _toggleSaved() async {
    final adId = widget.ad['id'] as int;
    final newState = await ApiService.toggleSavedAd(adId);
    setState(() => _isSaved = newState);
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
                      itemCount: images.length,
                      onPageChanged: (idx) => setState(() => _selectedImageIndex = idx),
                      itemBuilder: (ctx, idx) {
                        return Container(
                          color: const Color(0xFFF2F4F5),
                          child: Image.network(
                            images[idx],
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => const Center(
                              child: Icon(Icons.broken_image, size: 48, color: Colors.grey),
                            ),
                          ),
                        );
                      },
                    ),
                    if (images.length > 1)
                      Positioned(
                        bottom: 12,
                        child: Row(
                          children: List.generate(
                            images.length,
                            (i) => Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              width: _selectedImageIndex == i ? 16 : 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: _selectedImageIndex == i
                                    ? const Color(0xFF002F34)
                                    : Colors.black26,
                                borderRadius: BorderRadius.circular(3),
                              ),
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
                  // Price Tag
                  Text(
                    isFree ? 'Free' : '$price $currency',
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
                  const Text(
                    'Description',
                    style: TextStyle(
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
                                  const Row(
                                    children: [
                                      Icon(Icons.verified, size: 14, color: Color(0xFF0D9488)),
                                      SizedBox(width: 4),
                                      Text(
                                        'Verified Member',
                                        style: TextStyle(fontSize: 12, color: Colors.grey),
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
                            label: const Text(
                              'Chat with Seller (Messages)',
                              style: TextStyle(fontWeight: FontWeight.bold),
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
                              label: Text('Call: $phone'),
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
                            child: TextButton.icon(
                              onPressed: () => _emailSeller(authorEmail, title),
                              icon: const Icon(Icons.mail_outline, size: 18),
                              label: const Text('Email Seller'),
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.grey[700],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
