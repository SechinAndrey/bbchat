/**
 * API data mocks with additional fields to match UI requirements
 */

import type {
  ApiUser,
  ApiRoom,
  ApiMessage,
  ApiMessageFile,
  ApiNotification,
  ApiCall
} from '@src/api/types';

// User mock
export const userMock: ApiUser = {
  id: 101,
  role_id: 1,
  name: "Иван Петров",
  email: "ivan.petrov@example.com",
  email_key: null,
  type_reg: null,
  company: "ООО Ромашка",
  inn: "1234567890",
  nds: "20%",
  phone: "+380971234567",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  email_verified_at: null,
  settings: { locale: "ru" },
  folder_id: "folder-ivan-101",
  created_at: "2024-01-01T10:00:00.000Z",
  updated_at: "2025-04-16T09:00:00.000Z"
};

// Message files mock
const messageFilesMock: ApiMessageFile[] = [
  {
    name: "photo1.jpg",
    url: "https://random.imagecdn.app/500/150",
    type: "jpg",
    audio: false,
    /* BACKEND: size - file size */
    size: "2.1 MB",
    /* BACKEND: thumbnail - video preview */
    thumbnail: "https://random.imagecdn.app/100/75"
  },
  {
    name: "presentation.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    type: "pdf",
    audio: false,
    /* BACKEND: size - file size */
    size: "0.5 MB"
  },
  {
    name: "voice-message.mp3",
    url: "https://assets.mixkit.co/music/preview/mixkit-short-bass-beat-2292.mp3",
    type: "mp3",
    audio: true,
    /* BACKEND: size - file size */
    size: "1.2 MB"
  }
];

// Messages mock
export const messagesMock: ApiMessage[] = [
  {
    _id: 1,
    roomId: 1,
    content: "Привет, как дела?",
    senderId: "user_101",
    username: "Иван Петров",
    date: "16.04.2025",
    timestamp: "09:00",
    files: [],
    /* BACKEND: state - message status */
    state: "read"
  },
  {
    _id: 2,
    roomId: 1,
    content: "Всё отлично! А у тебя?",
    senderId: "user_102",
    username: "Мария Смирнова",
    date: "16.04.2025",
    timestamp: "09:01",
    files: [messageFilesMock[0]],
    /* BACKEND: state - message status */
    state: "read"
  },
  {
    _id: 3,
    roomId: 2,
    content: "Отправляю презентацию.",
    senderId: "user_103",
    username: "Алексей Кузнецов",
    date: "16.04.2025",
    timestamp: "10:15",
    files: [messageFilesMock[1]],
    /* BACKEND: state - message status */
    state: "delivered",
    /* BACKEND: previewData - link preview */
    previewData: {
      title: "Dummy PDF",
      description: "Тестовый PDF-файл для проверки.",
      domain: "w3.org",
      link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  },
  {
    _id: 4,
    roomId: 2,
    content: "Спасибо! Получил.",
    senderId: "user_101",
    username: "Иван Петров",
    date: "16.04.2025",
    timestamp: "10:17",
    files: [],
    /* BACKEND: state - message status */
    state: "read"
  },
  {
    _id: 5,
    roomId: 3,
    content: "Голосовое сообщение.",
    senderId: "user_104",
    username: "Ольга Иванова",
    date: "16.04.2025",
    timestamp: "11:00",
    files: [messageFilesMock[2]],
    /* BACKEND: state - message status */
    state: "sent"
  }
];

// Rooms mock
export const roomsMock: ApiRoom[] = [
  {
    roomId: 1,
    roomName: "Личные сообщения",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    receiver: "user_102",
    messenger_id: 1,
    users: [
      {
        _id: "user_101",
        username: "Иван Петров"
      },
      {
        _id: "user_102",
        username: "Мария Смирнова"
      }
    ],
    /* BACKEND: unread - number of unread messages */
    unread: 0,
    /* BACKEND: type - room type */
    type: "couple",
    /* BACKEND: lastActivity - last activity time */
    lastActivity: "16.04.2025 09:01"
  },
  {
    roomId: 2,
    roomName: "Рабочий чат",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    receiver: "user_103",
    messenger_id: 2,
    users: [
      {
        _id: "user_101",
        username: "Иван Петров"
      },
      {
        _id: "user_103",
        username: "Алексей Кузнецов"
      }
    ],
    /* BACKEND: unread - number of unread messages */
    unread: 1,
    /* BACKEND: type - room type */
    type: "couple",
    /* BACKEND: lastActivity - last activity time */
    lastActivity: "16.04.2025 10:17"
  },
  {
    roomId: 3,
    roomName: "Проект X",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    receiver: "user_104",
    messenger_id: 3,
    users: [
      {
        _id: "user_101",
        username: "Иван Петров"
      },
      {
        _id: "user_104",
        username: "Ольга Иванова"
      },
      {
        _id: "user_105",
        username: "Дмитрий Орлов"
      }
    ],
    /* BACKEND: unread - number of unread messages */
    unread: 2,
    /* BACKEND: type - room type */
    type: "group",
    /* BACKEND: lastActivity - last activity time */
    lastActivity: "16.04.2025 11:00"
  }
];

// Messengers mock
export const messengersMock = {
  telegram: 1,
  viber: 2,
  whatsapp: 3
};

// Contacts for calls and other functions
const contactsMock = [
  {
    id: 101,
    firstName: "Иван",
    lastName: "Петров",
    email: "ivan.petrov@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastSeen: new Date()
  },
  {
    id: 102,
    firstName: "Мария",
    lastName: "Смирнова",
    email: "maria@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastSeen: new Date()
  },
  {
    id: 103,
    firstName: "Алексей",
    lastName: "Кузнецов",
    email: "aleksey@example.com",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    lastSeen: new Date()
  },
  {
    id: 104,
    firstName: "Ольга",
    lastName: "Иванова",
    email: "olga@example.com",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    lastSeen: new Date()
  },
  {
    id: 105,
    firstName: "Дмитрий",
    lastName: "Орлов",
    email: "dmitry@example.com",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    lastSeen: new Date()
  }
];

// Mock for calls (call history)
export const callsMock: ApiCall[] = [
  {
    type: "voice",
    direction: "incoming",
    status: "missed",
    date: "15.04.2025",
    length: "00:00",
    members: [contactsMock[0], contactsMock[1]],
    adminIds: [101]
  },
  {
    type: "voice",
    direction: "outgoing",
    status: "sent",
    date: "14.04.2025",
    length: "02:45",
    members: [contactsMock[0], contactsMock[2]],
    adminIds: [101]
  },
  {
    type: "voice",
    direction: "incoming",
    status: "received",
    date: "13.04.2025",
    length: "05:12",
    members: [contactsMock[0], contactsMock[3], contactsMock[4]],
    adminIds: [104]
  }
];

// Mock for activeCall (current active call)
export const activeCallMock: ApiCall = {
  type: "voice",
  direction: "outgoing",
  status: "dialing",
  date: "16.04.2025",
  length: "00:00",
  members: [contactsMock[0], contactsMock[1]],
  adminIds: [101]
};

// Mock for notifications
export const notificationsMock: ApiNotification[] = [
  {
    flag: "security",
    title: "Недавний вход",
    message: "Был выполнен вход в ваш аккаунт с нового устройства"
  },
  {
    flag: "added-to-group",
    title: "Новая группа",
    message: "Вас добавили в новую группу"
  },
  {
    flag: "account-update",
    title: "Сброс пароля",
    message: "Ваш пароль был успешно сброшен"
  }
];

// Mock for archived conversations
export const archiveMock = [];

// Default settings
export const defaultSettingsMock = {
  lastSeen: true,
  readReceipt: true,
  joiningGroups: true,
  privateMessages: true,
  darkMode: false,
  borderedTheme: false,
  allowNotifications: true,
  keepNotifications: false
};

export default {
  user: userMock,
  conversations: [], // Will be populated through adapter
  notifications: notificationsMock,
  archive: archiveMock,
  calls: callsMock,
  activeCall: activeCallMock,
  defaultSettings: defaultSettingsMock,
  // API mocks
  apiData: {
    user: userMock,
    rooms: roomsMock,
    messages: messagesMock,
    messengers: messengersMock,
    notifications: notificationsMock,
    calls: callsMock,
    activeCall: activeCallMock
  }
};
