import 'package:flutter/material.dart';

class ComplaintsScreen extends StatelessWidget {
  const ComplaintsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المشاكل والاقتراحات')),
      body: Center(child: Text('صفحة إرسال الشكاوى والاقتراحات')),
    );
  }
}
