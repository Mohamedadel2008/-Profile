import 'package:flutter/material.dart';
import 'activities_screen.dart';
import 'complaints_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الرئيسية - من نحن')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset('assets/images/logo2.jpeg', width: 250),
              const SizedBox(height: 20),
              const Text(
                'عن مركز رسالة للتدريب (RTC)',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              const Text(
                'هنا سيتم وضع النص التعريفي لجمعية رسالة (RTC) بناءً على الملف الذي سيتم توفيره لاحقاً.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 30),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ActivitiesScreen()));
                    },
                    icon: const Icon(Icons.event),
                    label: const Text('الفعاليات'),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ComplaintsScreen()));
                    },
                    icon: const Icon(Icons.feedback),
                    label: const Text('الشكاوى'),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
