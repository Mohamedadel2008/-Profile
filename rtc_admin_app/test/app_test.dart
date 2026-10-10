import 'package:flutter_test/flutter_test.dart';
import 'package:rtc_admin_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const RTCAdminApp());
    expect(find.text('لوحة التحكم - RTC'), findsOneWidget);
  });
}
