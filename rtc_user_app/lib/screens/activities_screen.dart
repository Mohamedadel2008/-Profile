import 'package:flutter/material.dart';

class ActivitiesScreen extends StatelessWidget {
  const ActivitiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('النشاطات والفعاليات')),
      body: Center(child: Text('صفحة النشاطات والتسجيل المسبق')),
    );
  }
}
