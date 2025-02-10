const sortTime = (data: { [p:string]: number, time: number }[]) => data.sort((a, b) => a.time - b.time);

export default sortTime;