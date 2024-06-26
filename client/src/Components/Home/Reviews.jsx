import { BsStarFill } from "react-icons/bs";
import { BsStarHalf } from "react-icons/bs";
import { BsStar } from "react-icons/bs";

export default function Reviews() {
    const reviews = [ 
        { name: "Dr . Essam Mohamed", review: "I dealt with 'El Sarh' to buy my first home, and the experience was beyond amazing. The quality of construction and exceptional service made me feel confident in my choice.",start:<BsStarFill className="text-yellow-400"/>, rating: 5 },
        { name: "Eng . Mohammed", review: "A professional company in every sense! I purchased an apartment through 'El Sarh,' and they were committed to on-time delivery with a design that exceeded expectations.",start:<BsStarHalf className="text-yellow-400"/>, rating: 4.5 },
        { name: "Prof . Ali Ahmed", review: "What sets 'El Sarh' apart is their attention to the smallest details. From the start of the project to its completion, they provided us with a smooth and comfortable experience.",start:<BsStar className="text-yellow-400"/>, rating: 4 },
        { name: "Eng . Khaled Tawfiq", review: "'El Sarh's' projects are always of high quality. The team was very helpful and assisted me in finding the perfect home.",start:<BsStarHalf className="text-yellow-400"/>, rating: 4.5 },
        { name: "Prof . Nadia Mohammed", review: "If you're looking for a reliable and reputable real estate company, I highly recommend 'El Sarh.' Their modern designs and excellent service make them the best.",start:<BsStarHalf className="text-yellow-400"/>, rating: 4.5 },
        { name: "Dr . Emad Al , Sayed", review: "It was an exceptional experience with 'El Sarh.' The community atmosphere they create in their projects is unique, and I am very happy with my decision to buy a home through them.",start:<BsStarHalf className="text-yellow-400"/>, rating: 4.5 },
    ]
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
      shuffle(reviews);

  return (
    <div className=' py-8 bg-stone-100 dark:bg-stone-900'>
        <div className="grid md:grid-cols-2  lg:grid-cols-3 gap-3 divide-y md:divide-y-0 md:divide-x container">
            {/* Add review components here */}
             {reviews.slice(0,3).map((review, index) => (
                <>
               <div key={index} className="flex py-2">
                <div className=" w-1/4 ">
                    <img src="https://cdn.pixabay.com/photo/2012/04/26/19/43/profile-42914_1280.png" alt="user" className="mx-auto w-12 h-12 rounded-full object-cover"/>
                </div>
                <div className="flex-grow w-3/4">
                    <h5 className="text-sm font-medium text-[#034078] dark:text-blue-400">{review.name}</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.review}</p> 
                    <div className="flex justify-between items-center py-3">
                        <div className="flex space-x-2">
                         <BsStarFill className="text-yellow-400"/> 
                         <BsStarFill className="text-yellow-400"/> 
                         <BsStarFill className="text-yellow-400"/> 
                         <BsStarFill className="text-yellow-400"/> 
                         {review.start} 
                         </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{review.rating} stars</span>
                    </div>
                </div>
            </div>
            </> 
             ))}
        </div>
    </div>
  )
}
