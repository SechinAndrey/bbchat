# Changelog

All notable changes to this project will be documented in this file.

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
