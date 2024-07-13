import dayjs from 'dayjs'
import loacalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')
dayjs.extend(loacalizedFormat)

export function formattedStartDate(start_date: Date) {
  return dayjs(start_date).format('LL')
}

export function formattedEndDate(end_date: Date) {
  return dayjs(end_date).format('LL')
}
