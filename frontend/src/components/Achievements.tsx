// Achievements.js
// import { useState } from 'react';
import css from './Achievements.module.css';
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig


// const achievementsData = [
//   { title: "Bronze", image: "/icons/pngegg.png", progress: 60 },
//   { title: "Silver", image: "/icons/bronze.png", progress: 80 },
//   { title: "Gold", image: "/icons/pngegg.png", progress: 50 },
//   { title: "Platinum", image: "/icons/pngegg.png", progress: 40 },
//   { title: "Diamond", image: "/icons/pngegg.png", progress: 70 },
//   { title: "FT-PONG", image: "/icons/pngegg.png", progress: 90 },
// ];

const Achievements = () => {
  // const [currentIndex, setCurrentIndex] = useState(0);

  // const handlePrev = () => {
  //   setCurrentIndex((prevIndex) => (prevIndex === 0 ? achievementsData.length - 1 : prevIndex - 1));
  // };

  // const handleNext = () => {
  //   setCurrentIndex((prevIndex) => (prevIndex === achievementsData.length - 1 ? 0 : prevIndex + 1));
  // };

  return (
      <>
        <h3 className={css.title}>Achievements</h3>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>

      </>
  );
};

export default Achievements;
