import React, { useState, useEffect } from 'react';
import { Card, Tile } from '../Common/index';
import { ClassModal } from '../Modals/ClassModal';
import { EventModal } from '../Modals/EventModal';
import { useAppContext } from '../../hooks/useAppContext';
import {
  formatDate,
  getTodaysClasses,
  getRunningEventsToday,
  getClassStatusByAcademicCalendar,
} from '../../utils/dateUtils';

export function Home() {
  const { user, routines, calendarEvents, courses, presentCourses, setCurrentScreen } =
    useAppContext();

  const [currentTime, setCurrentTime] = useState(formatDate(new Date()));
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [todaysEvents, setTodaysEvents] = useState([]);
  const [classStatus, setClassStatus] = useState({ noClass: false, reason: '' });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDate(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const classes = getTodaysClasses(routines);
    const events = getRunningEventsToday(calendarEvents);
    const status = getClassStatusByAcademicCalendar(calendarEvents);
    setTodaysClasses(classes);
    setTodaysEvents(events);
    setClassStatus(status);
  }, [routines, calendarEvents]);

  const quickLinkGroups = [
    {
      title: 'Student Tools',
      links: [
        { icon: 'badge', label: 'Profile', screen: 'profile' },
        { icon: 'savings', label: 'Fees & Waivers', screen: 'fees' },
        { icon: 'download', label: 'Downloads', screen: 'downloads' },
      ],
    },
    {
      title: 'Courses',
      links: [
        { icon: 'pending_actions', label: 'Pending Courses', screen: 'pending' },
        { icon: 'menu_book', label: 'Present Courses', screen: 'present' },
        { icon: 'search', label: 'All Courses', screen: 'courses' },
      ],
    },
    {
      title: 'Academic',
      links: [
        { icon: 'front_hand', label: 'Attendance', screen: 'attendance' },
        { icon: 'checklist_rtl', label: 'Results', screen: 'results' },
        { icon: 'calendar_month', label: 'Routines', screen: 'routines' },
        { icon: 'event_available', label: 'Calendar', screen: 'calendar' },
      ],
    },
  ];

  const effectiveClasses = classStatus.noClass ? [] : todaysClasses;
  const classMessage = classStatus.noClass
    ? classStatus.reason || 'No classes today'
    : `${effectiveClasses.length} class${effectiveClasses.length !== 1 ? 'es' : ''} today`;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const dashboardStats = [
    {
      label: 'Classes Today',
      value: String(effectiveClasses.length),
      tone: classStatus.noClass ? 'muted' : 'info',
      onClick: () => setClassModalVisible(true),
    },
    {
      label: 'Running Events',
      value: String(todaysEvents.length),
      tone: todaysEvents.length > 0 ? 'warning' : 'muted',
      onClick: () => setEventModalVisible(true),
    },
    {
      label: 'Present Courses',
      value: String(Array.isArray(presentCourses) ? presentCourses.length : 0),
      tone: 'info',
      onClick: () => setCurrentScreen('present'),
    },
  ];

  return (
    <main className="layout home-layout">
      <Card variant="default">{currentTime}</Card>

      <section className="dashboard-welcome" aria-label="Dashboard summary">
        <p className="dashboard-welcome__eyebrow">Student Dashboard</p>
        <h1 className="dashboard-welcome__title">
          {greeting}, {user?.name?.split(' ')[0] || 'Student'}
        </h1>
        <p className="dashboard-welcome__subtitle">{classMessage}. Tap a stat card for details.</p>

        <div className="dashboard-stats" role="list" aria-label="Today overview">
          {dashboardStats.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`dashboard-stat dashboard-stat--${item.tone} dashboard-stat--interactive`}
              role="listitem"
              onClick={item.onClick}
            >
              <p className="dashboard-stat__value">{item.value}</p>
              <p className="dashboard-stat__label">{item.label}</p>
            </button>
          ))}
        </div>
      </section>

      {quickLinkGroups.map((group) => (
        <section key={group.title} className="home-link-group">
          <h2 className="home-link-group__title">{group.title}</h2>
          <div className="tiles home-link-group__grid">
            {group.links.map((link) => (
              <Tile
                key={link.screen}
                icon={link.icon}
                label={link.label}
                onClick={() => setCurrentScreen(link.screen)}
              />
            ))}
          </div>
        </section>
      ))}

      <ClassModal
        visible={classModalVisible}
        classes={effectiveClasses}
        courseNameMap={courses.courseNameMap || {}}
        onClose={() => setClassModalVisible(false)}
      />

      <EventModal
        visible={eventModalVisible}
        events={todaysEvents}
        onClose={() => setEventModalVisible(false)}
      />
    </main>
  );
}
