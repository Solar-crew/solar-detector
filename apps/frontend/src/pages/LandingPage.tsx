import { Link } from 'react-router-dom';
import { SolarPanel, Map, Zap, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LandingPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <SolarPanel className="w-16 h-16 text-accent animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Solar Detector</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze geographical areas to determine their suitability for solar panel installation.
            Make informed decisions about solar energy investments.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <Map className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Location Analysis</CardTitle>
              <CardDescription>
                Interactive map-based analysis of solar suitability for any location
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <SunMedium className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Sunlight Estimation</CardTitle>
              <CardDescription>
                Accurate estimation of annual sunlight hours and exposure
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Capacity Calculation</CardTitle>
              <CardDescription>
                Estimate roof area and potential solar panel capacity
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center mt-12">
          <Button asChild size="lg">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
