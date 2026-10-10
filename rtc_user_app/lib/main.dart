import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'theme.dart';
import 'screens/main_scaffold.dart';

void main() {
  runApp(const RTCUserApp());
}

class RTCUserApp extends StatelessWidget {
  const RTCUserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RTC رسالة',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ar', 'EG'), // Arabic
      ],
      locale: const Locale('ar', 'EG'), // Force Arabic
      home: const MainScaffold(),
    );
  }
}
