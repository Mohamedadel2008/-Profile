import 'package:flutter_test/flutter_test.dart';
import 'package:rtc_user_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const RTCUserApp());
    expect(find.text('الرئيسية - من نحن'), findsOneWidget);
  });
}
