import { Stack } from 'expo-router'

const StackLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_left'}}/>
    )
}

export default StackLayout