import springImg from '../assets/images/spring.webp'
import summerImg from '../assets/images/summer.webp'
import autumnImg from '../assets/images/autumn.webp'
import winterImg from '../assets/images/winter.webp'

const SEASONS = [
  { name: 'Spring', image: springImg },
  { name: 'Summer', image: summerImg },
  { name: 'Autumn', image: autumnImg },
  { name: 'Winter', image: winterImg },
]

export function SeasonStrips() {
  return (
    <div className="absolute inset-0 flex flex-row overflow-hidden" aria-hidden="true">
      {SEASONS.map(({ name, image }) => (
        <div
          key={name}
          className="relative flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}
    </div>
  )
}
