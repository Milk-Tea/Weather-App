import springImg from '../assets/images/spring.jpg'
import summerImg from '../assets/images/summer.jpg'
import autumnImg from '../assets/images/autumn.jpg'
import winterImg from '../assets/images/winter.jpg'

const SEASONS = [
  { name: 'Spring', image: springImg },
  { name: 'Summer', image: summerImg },
  { name: 'Autumn', image: autumnImg },
  { name: 'Winter', image: winterImg },
]

export function SeasonStrips() {
  return (
    <div className="absolute inset-0 flex flex-row overflow-hidden">
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
