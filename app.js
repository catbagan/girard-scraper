const rp = require('request-promise-native');
const otocsv = require('objects-to-csv')

const main = async () => {
  const getApartments = (date) => rp.post(
    'https://thegirard.com/wp-admin/admin-ajax.php',
    {
      form: {
        action: 'post_rp_stack',
        date,
      },
      json: true,
    }
  );

  const filterOneBedroom = a => a.bed === '1 Bedroom'
  const parsePrice = p => p === '$/mo' ? '' : p.match(/\d{4}/)[0]
  const parseSqft = s => s === 'SF' ? '' : s.match(/\d{3}/)[0]

  const dates = [
    '2020-6-17',
    '2020-7-1',
    '2020-7-14',
    '2020-8-1',
    '2020-8-14',
    '2020-8-30',
  ]

  const apts = []
  for (const date of dates) {
    const rawApts = (await getApartments(date)).filter(filterOneBedroom)

    for (const raw of rawApts) {
      let apt = apts.find(a => a.unit === raw.unit)
      if (apt != null) {
        apt[date] = parsePrice(raw.price)
      } else {
        apt = {
          unit: raw.unit,
          floor: raw.floor,
          sqft: parseSqft(raw.sq),
          plan: raw.unit.match(/\d{2}\b/)[0],
          link: raw.plan,
        }
        apt[date] = parsePrice(raw.price)
        apts.push(apt)
      }
    }
  }

  const csv = new otocsv(apts)
  csv.toDisk('data.csv')
}

main()