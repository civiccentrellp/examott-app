
// Course permissions
export const COURSE_PERMISSIONS = [
  "course.create",
  "course.view",
  "course.update",
  "course.delete",
];

// Content permissions
export const CONTENT_PERMISSIONS = [
  "content.create",
  "content.view",
  "content.update",
  "content.delete",
];

// User management permissions
export const USER_PERMISSIONS = [
  "user.create",
  "user.view",
  "user.update",
  "user.delete",
];

// Test-related permissions
export const TEST_PERMISSIONS = [
  "test.create",
  "test.view",
  "test.update",
  "test.delete",
  "test.attempt",
];

// Video-related permissions
export const VIDEO_PERMISSIONS = [
  "video.create",
  "video.view",
  "video.update",
  "video.delete",
];

export const ALL_CONTENT_PERMISSIONS = [
  ...CONTENT_PERMISSIONS,
  ...TEST_PERMISSIONS,
  ...VIDEO_PERMISSIONS,
];
