import dayjs from "dayjs";
import locale from "dayjs/locale/ru";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

export function initDayjs() {
  dayjs.locale(locale);
  dayjs.extend(relativeTime);
  dayjs.extend(localizedFormat);
}
