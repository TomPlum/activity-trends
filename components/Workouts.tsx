interface WorkoutsProps {
    data: String[]
}

const Workouts: React.FunctionComponent<WorkoutsProps> = ({data}) => {
    return (
        <div className="container">
            <p>Test</p>
            <p>{data}</p>
        </div>
    )
}

export default Workouts;