import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:deallyhub_mobile/widgets/app_image.dart';
import 'package:deallyhub_mobile/screens/ad_details_screen.dart';

void main() {
  test('AppImage getImageProvider returns NetworkImage for URLs and MemoryImage for base64', () {
    const url = 'https://example.com/test.png';
    final providerUrl = AppImage.getImageProvider(url);
    expect(providerUrl, isA<NetworkImage>());

    // 1x1 transparent GIF in base64
    final paddingA = 'A' * 60;
    final dummyBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$paddingA';
    final providerB64 = AppImage.getImageProvider(dummyBase64);
    expect(providerB64, isA<MemoryImage>());

    // Repeated call should return MemoryImage with identical cached bytes
    final providerB64Second = AppImage.getImageProvider(dummyBase64) as MemoryImage?;
    expect(providerB64Second, isNotNull);
    expect((providerB64 as MemoryImage).bytes, same((providerB64Second!).bytes));
  });

  testWidgets('AdDetailsScreen renders PageView carousel and image counter', (WidgetTester tester) async {
    final paddingA = 'A' * 60;
    final paddingB = 'B' * 60;
    final dummyB641 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$paddingA';
    final dummyB642 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7$paddingB';

    final testAd = {
      'id': 999,
      'title': 'Test Item',
      'price': 100,
      'currency': 'PLN',
      'category_slug': 'electronics',
      'category_name': 'Elektronika',
      'description': 'Description',
      'location': 'Warszawa',
      'images': [dummyB641, dummyB642],
      'author_name': 'Jan Kowalski',
      'phone': '123456789',
    };

    await tester.pumpWidget(
      MaterialApp(
        home: AdDetailsScreen(ad: testAd),
      ),
    );

    expect(find.byType(PageView), findsOneWidget);
    expect(find.text('1 / 2'), findsOneWidget);
  });
}
