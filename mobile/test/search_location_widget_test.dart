import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:deallyhub_mobile/screens/home_screen.dart';

void main() {
  testWidgets('HomeScreen renders search bar on top and location bar underneath', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: HomeScreen(),
      ),
    );

    // Let any initial microtasks run
    await tester.pump();

    // Verify search icon and text field
    expect(find.byIcon(Icons.search_rounded), findsWidgets);

    // Verify location pin icon exists
    expect(find.byIcon(Icons.location_on_rounded), findsWidgets);

    // Find Search TextField and Location TextField
    final textFields = find.byType(TextField);
    expect(textFields, findsNWidgets(2));

    // Check vertical positioning: Search field top is above Location field top
    final searchRect = tester.getRect(textFields.at(0));
    final locationRect = tester.getRect(textFields.at(1));

    expect(
      locationRect.top,
      greaterThanOrEqualTo(searchRect.bottom),
      reason: 'Location field must be placed below the search field',
    );

    // Verify Search button is rendered
    expect(find.byType(ElevatedButton), findsWidgets);
  });
}
