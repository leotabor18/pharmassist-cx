import { API_BASE_PATH } from "./axios";

const api = {
  RESET_PASSWORD                    : `${API_BASE_PATH}/auth/reset-password`,
  LOGIN                             : `${API_BASE_PATH}/public/login`,
  NEW_PASSWORD                      : `${API_BASE_PATH}/auth/new-password`,
  NEW_PASSWORD_CX                   : `${API_BASE_PATH}/auth/new-password-cx`,
  ADMINISTRATORS_BY_TOKEN           : `${API_BASE_PATH}/auth/search/findByToken`,
  USERS_BY_TOKEN                    : `${API_BASE_PATH}/auth/user`,
  STORE_API                         : `${API_BASE_PATH}/stores`,
  STORES_API                         : `${API_BASE_PATH}/store`,
  PRODUCT_CATEGORIES_API            : `${API_BASE_PATH}/productCategories`,
  PRODUCT_CATEGORY_API              : `${API_BASE_PATH}/productCategory`,
  PRODUCT_CATEGORIES_BY_STORE_ID_API: `${API_BASE_PATH}/productCategories/search/findByStoreStoreId`,
  PRODUCT_ITEMS_API                 : `${API_BASE_PATH}/productItems`,
  PRODUCT_ITEM_API                  : `${API_BASE_PATH}/productItem`,
  TRANSACTION_API                   : `${API_BASE_PATH}/transaction`,
  TRANSACTIONS_API                   : `${API_BASE_PATH}/transactions`,
  RESERVATIONS_API                   : `${API_BASE_PATH}/reservations`,
  RESERVATION_LIST_API                   : `${API_BASE_PATH}/reservationLists`,
  OPENING_HOURS_API                   : `${API_BASE_PATH}/openingHours`,
  CHAT_ROOMS_API                   : `${API_BASE_PATH}/chatRooms`,
  CHAT_ROOM_API                   : `${API_BASE_PATH}/chatRoom`,
  WEBSOCKET_API                   : `${API_BASE_PATH}/websocket`,
  OTP_VERIFY: `${API_BASE_PATH}/otp/verify`,
  OTP_FORGOT: `${API_BASE_PATH}/otp/forgot-password-verify`,
  
  USERS_API: `${API_BASE_PATH}/users`,
  USER_API : `${API_BASE_PATH}/user`,
};

export default api;