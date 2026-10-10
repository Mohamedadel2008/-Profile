import 'package:flutter/material.dart';
import 'admin_management_screen.dart';
import 'courses_management_screen.dart';
import 'volunteers_management_screen.dart';
import 'meetings_management_screen.dart';
import 'activities_management_screen.dart';
import 'complaints_management_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  String _appBarTitle = 'لوحة التحكم - RTC';

  final List<Widget> _pages = [
    const Center(child: Text('الرئيسية - الإحصائيات العامة')),
    const AdminManagementScreen(),
    const CoursesManagementScreen(),
    const VolunteersManagementScreen(),
    const MeetingsManagementScreen(),
    const ActivitiesManagementScreen(),
    const ComplaintsManagementScreen(),
  ];

  void _onItemTapped(int index, String title) {
    setState(() {
      _selectedIndex = index;
      _appBarTitle = title;
    });
    Navigator.pop(context); // Close drawer
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_appBarTitle)),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: Theme.of(context).primaryColor),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/images/logo2.jpeg', width: 80),
                  const SizedBox(height: 10),
                  const Text('RTC Admin', style: TextStyle(color: Colors.white, fontSize: 18)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text('الرئيسية'),
              selected: _selectedIndex == 0,
              onTap: () => _onItemTapped(0, 'لوحة التحكم - RTC'),
            ),
            ListTile(
              leading: const Icon(Icons.admin_panel_settings),
              title: const Text('المشرفين'),
              selected: _selectedIndex == 1,
              onTap: () => _onItemTapped(1, 'إدارة المشرفين'),
            ),
            ListTile(
              leading: const Icon(Icons.school),
              title: const Text('الكورسات'),
              selected: _selectedIndex == 2,
              onTap: () => _onItemTapped(2, 'إدارة الكورسات'),
            ),
            ListTile(
              leading: const Icon(Icons.group),
              title: const Text('المتطوعين'),
              selected: _selectedIndex == 3,
              onTap: () => _onItemTapped(3, 'إدارة المتطوعين'),
            ),
            ListTile(
              leading: const Icon(Icons.meeting_room),
              title: const Text('الاجتماعات'),
              selected: _selectedIndex == 4,
              onTap: () => _onItemTapped(4, 'إدارة الاجتماعات'),
            ),
            ListTile(
              leading: const Icon(Icons.event),
              title: const Text('النشاطات'),
              selected: _selectedIndex == 5,
              onTap: () => _onItemTapped(5, 'إدارة النشاطات'),
            ),
            ListTile(
              leading: const Icon(Icons.feedback),
              title: const Text('الشكاوى'),
              selected: _selectedIndex == 6,
              onTap: () => _onItemTapped(6, 'مراجعة الشكاوى'),
            ),
          ],
        ),
      ),
      body: _pages[_selectedIndex],
    );
  }
}
