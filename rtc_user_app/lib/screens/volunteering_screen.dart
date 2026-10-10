import 'package:flutter/material.dart';

class VolunteeringScreen extends StatelessWidget {
  const VolunteeringScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تطوع معنا')),
      body: Center(child: Text('صفحة طلب التطوع')),
    );
  }
}
