const lucide = require('lucide-react');

const usedIcons = [
  'Search', 'Filter', 'Users', 'Clock', 'CheckCircle2', 'AlertCircle', 
  'MoreVertical', 'Phone', 'Video', 'Stethoscope', 'ChevronLeft', 'ChevronRight',
  'UserPlus', 'Play', 'FastForward', 'CalendarClock', 'Ban', 'MapPin',
  'CalendarDays', 'ListFilter', 'MoreHorizontal', 'Calendar',
  'Printer', 'Check', 'User',
  'UserSearch', 'FileText', 'Activity', 'X', 'ClipboardList', 'Download',
  'Send'
];

const missing = usedIcons.filter(icon => !lucide[icon]);
console.log("Missing icons:", missing);
