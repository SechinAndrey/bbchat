# Changelog

All notable changes to this project will be documented in this file.

## 0.6.4 - 2026-01-09

### Bug Fixes

- Запрос разрешения на уведомления по клику для Safari(тепрь позволяет получить FCM токен для уведомлений)
- Моб. Модальное окно. Видалити повідомлення? [WS-18700430-21347691](https://trp4438.worksection.com/project/257910/18700430/21347691/)
- Контекстное меню. Внизу. [WS-18700430-21342234](https://trp4438.worksection.com/project/257910/18700430/21342234/)
- Вход. Ошибка доступа. [WS-18700430-21304149](https://trp4438.worksection.com/project/257910/18700430/21304149/)
- Mob. Файл длинное название. [WS-18700430-21257298](https://trp4438.worksection.com/project/257910/18700430/21257298/)
- Вывод канала коммуникации Chaport только если он доступен WS-project/257910/18700430/21257487

### Features

- **(iframe)** Улучшен процесс авторизации по токену
- Add link to user guide
- Add new logo
- Нотификация. Відвідувач залишив чат. [WS-18700430-21320130](https://trp4438.worksection.com/project/257910/18700430/21320130/)
- Добавлена возможность скачивания видео из сообщений на устройство [WS-18700430-21294465](https://trp4438.worksection.com/project/257910/18700430/21294465/)

### Project Maintenance

- Release version 0.6.4

## 0.6.3 - 2025-12-25

### Bug Fixes

- Mob. Видео превью. [WS-18700430-21257211](https://trp4438.worksection.com/project/257910/18700430/21257211/)
- Слідкувати за дошками. Список. [WS-18700430-21223317](https://trp4438.worksection.com/project/257910/18700430/21223317/)

### Features

- Прикрепить файл Drag and drop [WS-18700430-21308622](https://trp4438.worksection.com/project/257910/18700430/21308622/)
- Редактирование/удаление сообщения. Менеджером. [WS-18700430-21111672](https://trp4438.worksection.com/project/257910/18700430/21111672/) [WS-18700430-21235806](https://trp4438.worksection.com/project/257910/18700430/21235806/)
- Сохраненные ответы [WS-18700430-21020913](https://trp4438.worksection.com/project/257910/18700430/21020913/)
  - Добавлена возмжность создавать шаблон сообщения из сообщения в чате
  - Добавлен выбор шаблона в поле чата
  - Базовые шаблоны сообщений на странице настроек
  - Добавлена базовая структура страниц настроек
  - Фронртенд связан с API
- Вывод непрочитанных сообщений по категориям(лиды, клиенты, поставщики)
- Chaport. Лид покинул чат. [WS-18700430-21086979](https://trp4438.worksection.com/project/257910/18700430/21086979/)
- Добавлена обработка события "message-liked" для отображения лайка сообщения из Viver
- Добавлено отображения лайка для сообщений

### Project Maintenance

- Развернуто стейбл окружение с дев базой данних для тестирования релизов - https://stable.chat.billboards.com.ua
- Add logs for onBackgroundMessage FCM
- Add -app-name for deploy srcript
- Release version 0.6.3

## 0.6.2 - 2025-12-09

### Bug Fixes

- AuthorTextColor for message
- Kanban статус. Смена чата. [WS-18700430-21206280](https://trp4438.worksection.com/project/257910/18700430/21206280/)
- Чат стикеры. [WS-18700430-20302625](https://trp4438.worksection.com/project/257910/18700430/20302625/)
- Додати із корзини. Не работает. [WS-18700430-21214344](https://trp4438.worksection.com/project/257910/18700430/21214344/)
- Исправлена обработка входящих сообщений от нового(неприсвоенного) чапорт лида

### Features

- Обработка пушер события lead-change-user
- Закрытие диалога. Нотификация. [WS-18700430-21127611](https://trp4438.worksection.com/project/257910/18700430/21127611/)

### Project Maintenance

- Удаление логов
- Release version 0.6.2

## 0.6.1 - 2025-12-01

### Bug Fixes

- Історія статусів. Выровнять. [WS-18700430-20943753](https://trp4438.worksection.com/project/257910/18700430/20943753/)
- Закрытие чата. [WS-18700430-21068988](https://trp4438.worksection.com/project/257910/18700430/21068988/)
- Перевод из лида в клиента(меню на ПК) [WS-18700430-21087066](https://trp4438.worksection.com/project/257910/18700430/21087066/)
- Вход. Показать пароль. [WS-18700430-21088902](https://trp4438.worksection.com/project/257910/18700430/21088902/)
- Чат при удаление контакта. [WS-18700430-21118842](https://trp4438.worksection.com/project/257910/18700430/21118842/)

### Features

- Чат стикеры. [WS-18700430-20302625](https://trp4438.worksection.com/project/257910/18700430/20302625/)
- Звуковой файл. Ширина. [WS-18700430-21133791](https://trp4438.worksection.com/project/257910/18700430/21133791/)
- Подборки. Выбор строки [WS-18700430-21087249](https://trp4438.worksection.com/project/57910/18700430/21087249/)
- Улучшение layout панелей(левая, средняя, правая); Окно поиска. Изменения размера. [WS-18700430-21133818](https://trp4438.worksection.com/project/257910/18700430/21133818/)
- Realtime обновление списка статусов после изменения статуса
- Добавить PWA [WS-18700430-21099555](https://trp4438.worksection.com/project/257910/18700430/21099555/)

### Project Maintenance

- Оптимизация продакшн сборки; раздение на отдельные чанки
- Disable dev mode for PWA
- Update .gitignore
- Release version 0.6.1

## 0.6.0 - 2025-11-21

### Bug Fixes

- Всі/Відриті граници [WS-18700430-20281601](https://trp4438.worksection.com/project/257910/18700430/20281601/)
- Mob. Кнопки хедера. [WS-18700430-21063498](https://trp4438.worksection.com/project/257910/18700430/21063498/)
- Mob. Kanban статус. [WS-18700430-21062214](https://trp4438.worksection.com/project/257910/18700430/21062214/)
- LoadMore для списка чатов
- New-message: добавлять элемент списка чатов тольк для выбранной вкладки
- Старт\стоп чат

### Features

- Улучшена обработка входящих сообщений
  - роль менеджера:
    - Исправлена ошибка воспроизведения звука входящего сообщения другому менеджеру. Теперь звук воспроизводится только если сообщение предназначено текущему пользователю.
    - Испрвлено появление в списке чатов чата другого менеджера.
    - Исправлено появление в списке чатов, чата другой сущности (лид в списке клиента или поставщика и т.д.)
    - добавленена визауальная индикация нового сообщения для когда юзер находится на другой странице(например в списке клиентов) а сообщение пришло в чат лидов(https://drive.google.com/file/d/1z-PeFWlCXlTud_SS7BNB-Hld6xJ6pnPa/view?usp=drive_link).
  - роль админа:
    - В случе когда выбраны все мненеджеры, входящее сообщение воспроизводят звук и добавляются в список чатов.
    - В случае когда выбран конкретный менеджер, входящее сообщение воспроизводят звук и добавляются в список чатов только для выбраного менеджера, при этом сообщения для других менеджеров НЕ воспроизводят звук и НЕ добавляются в список чатов, но отображаются визуальным индикаторм в селектте(https://drive.google.com/file/d/1tUSX7R_nksQebS4dwC3CDcYl4YFxHXlC/view?usp=drive_link) сигнализируя что у другого менеджера есть новое сообщение(https://drive.google.com/file/d/1y6KqoC2KsmcPBGhxldAORY_idplEJmiY/view?usp=drive_link).

  _\* Данная визуальная индикация это временное frontend решение, пока мы не внедрим полноценные счетчика входящих по необходимым категориям. Индикация сбрасывается при переходе на страницу где было уведомление или после обновления страницы_

- Добавил вывод транскрипции в сообщение со звонком [Binotel. Транскрипция.](https://trp4438.worksection.com/project/257910/18700430/21086847/)
- Улучшен компонент отвечающий за транскрипцию; Добавлен вывод Summary и Полного разговора; Реализовано форматирование Summary при помощи npm пакета marked
- Единое отображение статусов звонков, входящие, исходящие, ответ, занято, отменён и тд..
- Более широкое сообщение звонка, плеер теперь шире и можно проматывать запись разговора
- VB. Смайлы. [WS-18700430-20311157](https://trp4438.worksection.com/project/257910/18700430/20311157/)
- Improve chat item structure
- Добавить аватары. [WS-18700430-21049968](https://trp4438.worksection.com/project/257910/18700430/21049968/)
- Несколько файлов. [WS-18700430-21096495](https://trp4438.worksection.com/project/257910/18700430/21096495/)
- Add current user name to AccountDropdown
- Смена менеджера. Чат. [WS-18700430-21088575](https://trp4438.worksection.com/project/257910/18700430/21088575/)
- Копировать линк. Уведомление. [WS-18700430-21063210](https://trp4438.worksection.com/project/257910/18700430/21063210/)
- Выбор менеджера. Имя [WS-18700430-21091227](https://trp4438.worksection.com/project/257910/18700430/21091227/)
- Перевод из лида в клиента [WS-18700430-21087066](https://trp4438.worksection.com/project/257910/18700430/21087066/)
- Тестовый клиент для чата в CRM [WS-18700430-21079884](https://trp4438.worksection.com/project/257910/18700430/21079884/)

### Project Maintenance

- Fix notifications platform while loading
- Release version 0.6.0

## 0.5.1 - 2025-11-12

### Bug Fixes

- Закрыть открыть контакт(чат). Для отображения во вкладках "всі" "відкриті"

### Features

- Чат. Scrollbar. [WS-18700430-20294123](https://trp4438.worksection.com/project/257910/18700430/20294123/)
- Improve message responsive(time, avatar) - тут были визуальные дефекты сообщения при длинных имененах файлов, также перенёс отображения времени вутырь сообщения(как в тг), потому как вне блока справа время крало место на телефонах и для аватара и и полезного контента сообщения было меньше места
- Чат. Scrollbar. [WS-18700430-20294123](https://trp4438.worksection.com/project/257910/18700430/20294123/)

### Project Maintenance

- Release version 0.5.1

## 0.5.0 - 2025-11-11

### Bug Fixes

- APK. Додати вкладення. [WS-18700430-21062136](https://trp4438.worksection.com/project/257910/18700430/21062136/)
- Слідкувати за дошками. Периоды. [WS-18700430-21049086](https://trp4438.worksection.com/project/257910/18700430/21049086/)

### Features

- Cusomize android app
- Config android StatusBar
- Add android app name
- Вывод имени. [WS-18700430-21068979](https://trp4438.worksection.com/project/257910/18700430/21068979/)
- Закрытие чата. [WS-18700430-21068988](https://trp4438.worksection.com/project/257910/18700430/21068988/)
- Синхронизация контакта для чапорта [WS-18700430-21059505](https://trp4438.worksection.com/project/257910/18700430/21059505/)

### Project Maintenance

- Yarn.lock
- Release version 0.5.0

## 0.4.1 - 2025-11-10

### Bug Fixes

- По клику на пуш уведомление браузера открывать нужный чат [WS-18700430-21020295](https://trp4438.worksection.com/project/257910/18700430/21020295/)
- Mob. Safari. WS-project/257910/calendar
- ConversationInfoSection actions dropdown
- ConversationInfoSection actions dropdown - for admin\manager

### Features

- Improve attachment display in conversatons - Последнее сообщения, когда файл. [WS-18700430-20931927](https://trp4438.worksection.com/project/257910/18700430/20931927/)
- Отправка файлов. Энтер [WS-18700430-21023733](https://trp4438.worksection.com/project/257910/18700430/21023733/)
- Reply. Поле для сообщения. [WS-18700430-21042933](https://trp4438.worksection.com/project/257910/18700430/21042933/)

### Project Maintenance

- Update watchedDate
- Release version 0.4.1

## 0.4.0 - 2025-11-09

### Bug Fixes

- Порядок сообщений. [WS-18700430-20969634](https://trp4438.worksection.com/project/257910/18700430/20969634/)

### Features

- Контакты. Редактирование. [WS-18700430-20951907](https://trp4438.worksection.com/project/257910/18700430/20951907/)
- Удаление сообщения. [WS-18700430-20303663](https://trp4438.worksection.com/project/257910/18700430/20303663/)
- Add file formats to upload .xlsx,.xls,.zip,.rar - Формат файла. [WS-18700430-21020310](https://trp4438.worksection.com/project/257910/18700430/21020310/)
- Добавить аватары. [WS-18700430-21049968](https://trp4438.worksection.com/project/257910/18700430/21049968/)
- Iframe фиксы [WS-18700430-21051357](https://trp4438.worksection.com/project/257910/18700430/21051357/)
- Feat: Клиенты. Доп меню. [WS-18700430-21046470](https://trp4438.worksection.com/project/257910/18700430/21046470/)
  Поставщики. Доп меню. [WS-18700430-21046479](https://trp4438.worksection.com/project/257910/18700430/21046479/)
- Статус сообщения. [WS-18700430-20302985](https://trp4438.worksection.com/project/257910/18700430/20302985/)
- Chaport. Файлы. [WS-18700430-20929353](https://trp4438.worksection.com/project/257910/18700430/20929353/)
- Ответы для вайбера. [WS-18700430-21049197](https://trp4438.worksection.com/project/257910/18700430/21049197/)
- Слідкувати за дошками. Периоды. [WS-18700430-21049086](https://trp4438.worksection.com/project/257910/18700430/21049086/)
- Process incoming failes

### Project Maintenance

- Release version 0.4.0

## 0.3.0 - 2025-11-07

### Bug Fixes

- Добірки. Формат. [WS-18700430-21014934](https://trp4438.worksection.com/project/257910/18700430/21014934/)
- Названия файла. Кирилица. [WS-18700430-21020298](https://trp4438.worksection.com/project/257910/18700430/21020298/)

### Features

- Названия разделов. [WS-18700430-21020250](https://trp4438.worksection.com/project/257910/18700430/21020250/)
- Добірки. Кнопки. [WS-18700430-20951808](https://trp4438.worksection.com/project/257910/18700430/20951808/)
- [andoid] Уведомления firebase [WS-18700430-21020313](https://trp4438.worksection.com/project/257910/18700430/21020313/)
- TG. Цитата. [WS-18700430-21017568](https://trp4438.worksection.com/project/257910/18700430/21017568/)
- VB. Чат ответы. [WS-18700430-20310338](https://trp4438.worksection.com/project/257910/18700430/20310338/)
- Add contragent_contact_id for SendMessageParams
- Update the chat structure to support active contact and improve navigation. Improve Lead actions
- TG. Чат ответы. [WS-18700430-20302694](https://trp4438.worksection.com/project/257910/18700430/20302694/)
- Add reply functionality to chat messages

### Project Maintenance

- Update Android SDK and add build script
- Release 0.3.0

## 0.2.0 - 2025-10-31

### Bug Fixes

- Сообщение Имя. [WS-18700430-20970111](https://trp4438.worksection.com/project/257910/18700430/20970111/)
- Отправка файла. - icon for audio [WS-18700430-20293958](https://trp4438.worksection.com/project/257910/18700430/20293958/)
- Объединения лида. [WS-18700430-20969946](https://trp4438.worksection.com/project/257910/18700430/20969946/)
- ToastError AttachmentsModal.vue
- Autoselect z-index
- Resolve modal z-index stacking and teleport SelectionsModal to body
- Icons size for mobile
- Mousedown and touch event for closing modal on backdrop interaction
- Дублирование лида. [WS-18700430-20327696](https://trp4438.worksection.com/project/257910/18700430/20327696/)
- Вертикальная картинка. [WS-18700430-20401811](https://trp4438.worksection.com/project/257910/18700430/20401811/)
- Double telegram. [WS-18700430-20923623](https://trp4438.worksection.com/project/257910/18700430/20923623/)

### Features

- Add audio support for MediaPreview.vue
- Отправка файла [WS-18700430-20293958](https://trp4438.worksection.com/project/257910/18700430/20293958/)
- Add isOneEnabledMessenger helper; improve chat layout
- Add disabled states and descriptions to messenger selection options; improve communication channel select UI
- Контакты. Клиент. Посада. [WS-18700430-20953032](https://trp4438.worksection.com/project/257910/18700430/20953032/)
- Контакты. Редактирование. [WS-18700430-20951907](https://trp4438.worksection.com/project/257910/18700430/20951907/)
- Header. Функционал. [WS-18700430-20283467](https://trp4438.worksection.com/project/257910/18700430/20283467/)

### Styles

- Improve channel select

## 0.1.2 - 2025-10-28

### Features

- Контакты. Ник телеграмма. [WS-18700430-20952219](https://trp4438.worksection.com/project/257910/18700430/20952219/)
- Додати контакт. Выбор контакта. [WS-18700430-20952039](https://trp4438.worksection.com/project/257910/18700430/20952039/)
- Добірки. Смена чата. [WS-18700430-20936955](https://trp4438.worksection.com/project/257910/18700430/20936955/)
- Setup validation system with vee-validate; zod; Додати ліда. Обязательные поля. [WS-18700430-20274098](https://trp4438.worksection.com/project/257910/18700430/20274098/)

### Bug Fixes

- Ensure phone value is never undefined when sending messages
- Нічого не знайдено AutocompleteSelect [WS-18700430-20952981](https://trp4438.worksection.com/project/257910/18700430/20952981/)
- Use useMessageSending for chaport

### Project Maintenance

- Upgrade vee-validate to v5 beta and remove @vee-validate/zod dependency

### Revert

- Textarea before validation system

## 0.1.1 - 2025-10-23

### Bug Fixes

- Два контакта. Один чат. [WS-18700430-20945805](https://trp4438.worksection.com/project/257910/18700430/20945805/)
- MessageV2 when empty message text
- Отправка сообщения. Энтер. [WS-18700430-20929257](https://trp4438.worksection.com/project/257910/18700430/20929257/)
- Картинки просмотр. [WS-18700430-20929863](https://trp4438.worksection.com/project/257910/18700430/20929863/)
- Модальное окно. Видалити підбірку? [WS-18700430-20936883](https://trp4438.worksection.com/project/257910/18700430/20936883/)
- MainContent layout height

### Features

- Размер поля сообщения. - [WS-18700430-20932458](https://trp4438.worksection.com/project/257910/18700430/20932458/)
- Линия перед полем для сообщения. - [WS-18700430-20932395](https://trp4438.worksection.com/project/257910/18700430/20932395/)

### Bug Fixes

- Select
- Scroll bottom chatMiddle
- ChatTop responsive
- Select setMessengerId after pusher message
- Build ChatBottom title
- Profile AccountDropdown
- Remove unnecessary phone check in message sending
- Types for conversations store fetch
- Adjust sidebar width for better responsiveness
- Improve chat loading states and transitions for better UX
- Correct message submiting by ctrl+enter
- Reverse message order to display chronologically from top to bottom
- Improve responsive layout and text truncation in chat header and conversation list
- MessageV2 viber attachments
- ChatBottom textarea
- Adjust responsive layout and navigation for mobile
- Improve scrolling behavior for right sidebar tabs
- Tab compact
- CurrencyInput
- New lead modal types
- Selections texts
- Change status
- Process puser new-message propperly
- CallTab - show transcrition height
- CallPlayer width
- Replace AudioPlayer with audio tag
- Chat middle activeConversation
- MessageV2 display time
- Chat loading afrter refresh page
- FetchConversationById after communication change
- Nav search
- Ts erros, cleanup
- Password input
- Messages order
- Messages in conversations
- Improve data initialization process and UI loading states
- Imports; types for prod build
- Fix externalize video.ks
- Fixes and new ui components
- Fix clicking back to close conversations
- Fix broken github link preview
- Fix drafts on mobile screen
- Fix images not showing in build
- Fix cached screen height
- Fix height on mobile screens
- Fix type errors
- Add change price

### Code Refactoring

- **(api)** Prepare project for real api
- **(architecture)** Core -> shared
- **(architecture)** Migrate to feature-based architecture
- Pusher when app open + firebase-messaging-sw.js if tab closed
- Empty and loading states
- Replace toast notifications with useToast composable
- Update message status colors
- Update type for message and conversation handling
- Conversatons and messages
- Add useMessageSending composable
- Communication entity types and APIs into unified interfaces
- Add type safety for slide animations and improve component props
- Rename Canban to Kanban, show Kanban status for leads only
- Update inject usage to use Ref type for entity and id in multiple components
- Change CurrencyInput to use number type and handle empty values
- Add EntityType
- Entity as conversations filed
- Messages storage
- Improve NoChatSelected
- Full conversation info to activeConversationInfo
- Split ui-kit
- Refactor components

### Features

- **(api)** Implement communication adapters and services for handling conversations
- **(auth)** Basic auth with email + pass; Save token to localStorage
- **(chat)** Add context menu for messages with copy and reply actions
- **(chat-middle)** Add media to message
- **(contact)** Add job title selection for client contact creation
- **(ui)** Implement new universal Dropdown component
- Change ConversationInfoSection btns; move MessengerOption to useMessengerSelection.ts
- New login form
- Show name conversation and chatTop
- Process TempMessage for chaport
- Disable attachments button for Chaport messenger
- Integrate event bus for login/logout events and clear FCM token on logout
- Add ai assistant icon; fix: isSelf
- Integrate Firebase Cloud Messaging for chat notifications
- Add role-based access control; add role ID in auth service
- Improve messengerOptions in ChatBottom
- Add chaport to messengerOptions
- Add message direction and display name logic to Conversation component
- Add loading states and UI feedback to widget authentication flow
- Add widget(iframe) mode support
- Procces new messages for conversation item
- Add messenger icons and improve message display in conversation list
- Redirect to chat after adding
- Add chat button to switch between contact conversations
- Update UI after creating lead
- Add name attributes to NewLeadModal form
- Add optimistic message updates with temporary message state
- Add outgoing message sound
- Add notification sound for new messages
- Add timeline dividers and unread messages indicator in chat
- Update unread message counter
- Get message by pusher messagy id
- Wip add lead actions
- Add UTM and page source info display for admin users
- Add dark mode toggle button to mobile navigation
- Add dark mode toggle button to mobile navigation
- Redesign mobile selection table; fix dropdown
- Add responsive styles for mobile
- Responsive RightSidebar
- Add lead comment editing
- Sync conversation filter with route entity param
- Add message text formatting
- Implement emoji picker with cursor position support in chat input
- Add contact management with modal UI and API
- Implement debounced data fetching for communications
- Enhance contact display in CommonInfoTab and inject contactId
- Update selection table after actions
- Communications with contacts
- Add BoardAvailabilityFull
- Improve download xls
- Download with selected cols
- Add CurrencyInput
- Add mobile style for sidebar, top chat
- View images SelectionTable
- Add date format SelectionTable
- Improve SelectionsTable and Checkbox
- Improve Checkbox
- Add basic SelectionTable
- Add basic SelectionsModal
- Add deleteSelection
- Add scroll SetsTab
- Add confirmation modal for sets
- SetsTab makeup
- Add EmptyState
- Improve CallTranscription
- CallsTab style
- Add styles for CommonInfoTab
- Add vue3-toastify
- Close dialog
- Add Calltranscription
- Add AudioPlayer, CallPlayer
- Get call recording
- Message search
- Load more messages
- Add avatar for MessageV2
- Makeup ui
- Add AutocompleteSelect
- New lead modal
- Add attachment ability
- Add pusher
- New sidebar design
- Add theme system

### Improvements

- Improve responsibility

### Project Maintenance

- **(deploy)** Fix output problem; improve redirect http => https
- **(deploy)** Enable HTTP/2 support in SSL configuration for create-nginx-config.sh
- **(deploy)** Update SSL configuration in create-nginx-config.sh to support http2 and unique shared memory zone
- **(deploy)** Add ability use https with create-nginx-config.sh
- **(deploy)** Improve prepare-scripts.sh make file executable for git
- **(deploy)** Modify create-nginx-config.sh for allow use iframe
- **(deploy)** Remove unnecessary checks from create-nginx-config.sh
- **(deploy)** Improve create-nginx-config.sh
- **(deploy)** Add create-nginx-config.sh script
- **(deploy)** Fix depoy scripts
- **(deploy)** Improve deployment scripts and documentation
- **(dev-flow)** Setup flow for git commit
- **(env)** Update node version 20.13.0 => 20.17.0
- Add sass-embedded
- Remove commitizen and conventional changelog dependencies
- Npm run format - prettier
- Add board theme
- Add conversations status tabs and slides
- Add UI-kit page
- Add release:preview commands to package.json

### Style

- Replace triangle indicator with Current label for active contact
- RightSidebar
