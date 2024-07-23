import loacalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import dayjs from 'dayjs'

dayjs.locale('pt-br')
dayjs.extend(loacalizedFormat)

export function differenceInDaysBetweenTripStartAndEnd(
  start_date: Date,
  end_date: Date,
) {
  return dayjs(end_date).diff(start_date, 'days')
}
