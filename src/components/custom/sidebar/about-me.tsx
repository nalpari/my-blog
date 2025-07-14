import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Code } from 'lucide-react'

export const AboutMe = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          About Me
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">Devgrr</h3>
          <p className="text-sm text-muted-foreground">
            새로운 기술을 배우고 성장하는 것을 좋아하는 개발자입니다.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>대한민국, 서울</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>2025년부터 블로깅</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">보유 기술</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              React
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Next.js
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Vue
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Nuxt.js
            </Badge>
            <Badge variant="secondary" className="text-xs">
              TypeScript
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Tailwind CSS
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Node.js
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Nest.js
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Spring Boot
            </Badge>
            <Badge variant="secondary" className="text-xs">
              FastAPI
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Laravel
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Ruby on Rails
            </Badge>
            <Badge variant="secondary" className="text-xs">
              RDB
            </Badge>
            <Badge variant="secondary" className="text-xs">
              NoSQL
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Supabase
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Docker
            </Badge>
            <Badge variant="secondary" className="text-xs">
              k8s
            </Badge>
            <Badge variant="secondary" className="text-xs">
              AWS
            </Badge>
            <Badge variant="secondary" className="text-xs">
              GCP
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            "코드로 세상을 더 나은 곳으로 만들어가는 개발자"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
