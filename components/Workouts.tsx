interface WorkoutsProps {
    data: String[]
}

const Workouts: React.FunctionComponent<WorkoutsProps> = (data) => {
    return (
        <p>{data[0]}</p>
    )
}

export default Workouts;