import React from "react";
import { View, ViewStyle } from "react-native";
import { Svg, Path } from "react-native-svg";

// Define the props for sizing and color
interface LeagoMarkProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
  className?: string; // Assuming Tailwind or utility class support
}

const LeagoMark: React.FC<LeagoMarkProps> = ({
  width = 190, // Default width
  height = 190, // Default height
  color = "#fff", // Default color (white)
  style,
  className,
}) => {
  return (
    <View
      style={[
        {
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: [{ translateX: -width / 2 }, { translateY: -height / 2 }],
        },
        style,
      ]}
      className={`my-1 ${className} w-2/4  h-2/4 `}
    >
      <Svg width={width} height={height} viewBox="0 0 60.153 13.771">
        <Path
          d="M548.713,420.6h-3.08l-1.416,13.247h8.8l.282-2.64h-5.72Z"
          transform="translate(-544.217 -420.087)"
          fill={color}
        />
        <Path
          d="M681.73,433.849h8.8l.282-2.64h-5.72l.284-2.659h5.72l.283-2.647h-5.72l.284-2.66h5.72l.282-2.64h-8.8Z"
          transform="translate(-671.783 -420.087)"
          fill={color}
        />
        <Path
          d="M1028.76,415.413a5.706,5.706,0,0,0-4.462-1.932,6.938,6.938,0,0,0-4.192,1.375l-.1-.131-.68-.9-.412,1.843-.2.913-.382,1.711,1.657.076.838.038,2.025.093-.882-1.17-.1-.128a3.685,3.685,0,0,1,2.1-.637,3.045,3.045,0,0,1,2.381,1.03,3.083,3.083,0,0,1,.763,2.49,3.813,3.813,0,0,1-1.3,2.491,3.859,3.859,0,0,1-3.2.923,5.2,5.2,0,0,1-2.771-1.757,13.988,13.988,0,0,1-2.406-3.5,10.5,10.5,0,0,0-1.54-2.145,6.981,6.981,0,0,0-6.653-1.912,7.737,7.737,0,0,0-5.676,5.232,6.193,6.193,0,0,0,1.193,5.912,5.708,5.708,0,0,0,4.463,1.931,7.077,7.077,0,0,0,4.88-1.936,1.379,1.379,0,0,0,.2-.264l.42-3.93h-3.08l-.277,2.592a3.687,3.687,0,0,1-1.809.458,3.044,3.044,0,0,1-2.381-1.029,3.471,3.471,0,0,1-.071-4.307,4.376,4.376,0,0,1,2.747-1.66c2.589-.539,4.125,1.451,5.221,3.33,1.275,2.186,2.312,4.313,4.748,5.416,4.136,1.873,9.839-.812,10.377-5.841a5.776,5.776,0,0,0-1.432-4.668"
          transform="translate(-970.082 -413.481)"
          fill={color}
        />
        <Path
          d="M828.458,432.922l-3.523-12.32h-3.52l-6.157,12.32h0l-.463.926h3.346l1.057-2.116c.9.069,1.83.1,2.775.1s1.881-.035,2.8-.1l.605,2.116h3.346l-.265-.926Zm-6.2-3.75q-.915,0-1.759-.043l2.243-4.488,1.284,4.488q-.854.042-1.768.043"
          transform="translate(-795.222 -420.087)"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default LeagoMark;
