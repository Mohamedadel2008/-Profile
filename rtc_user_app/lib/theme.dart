import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // RTC Brand Colors based on the logo
  static const Color darkBlue = Color(0xFF0F1A3B); // Background / Main Dark Blue
  static const Color yellow = Color(0xFFFBE42E); // Text yellow
  static const Color lightBlue = Color(0xFF5AB9EA); // Decorative dots / accents
  static const Color white = Colors.white;

  static ThemeData get theme {
    return ThemeData(
      primaryColor: darkBlue,
      scaffoldBackgroundColor: white,
      colorScheme: ColorScheme.fromSeed(
        seedColor: darkBlue,
        primary: darkBlue,
        secondary: yellow,
        tertiary: lightBlue,
      ),
      textTheme: GoogleFonts.cairoTextTheme().apply(
        bodyColor: darkBlue,
        displayColor: darkBlue,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: darkBlue,
        foregroundColor: white,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: darkBlue,
          foregroundColor: white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}
