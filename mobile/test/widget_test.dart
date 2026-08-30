import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:deallyhub_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DeallyhubApp());
    expect(
      find.byWidgetPredicate(
        (widget) => widget is RichText && widget.text.toPlainText().contains('Deally'),
      ),
      findsWidgets,
    );
  });
}
