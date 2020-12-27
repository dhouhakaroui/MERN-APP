import {React , useState,useEffect }from 'react'
import {useDispatch,useSelector} from 'react-redux'
import { addPost } from '../actions/postActions'
function NewPost({user}) {
    const posts=useSelector(state=>state.postReducer)
    const dispatch=useDispatch()
    const [post, setpost] = useState({
        user:user._id,
        name:user.firstName +" "+user.lastName ,
        text:"",
        avatar:user.avatar||"avatar.jpg",
        comments:[]
    })
    const [errors, setErrors] = useState(null)
    useEffect(() => {if (posts.errors){ setErrors(posts.errors)}},[posts.errors])    
    const handleChange=(e)=>{setpost({...post,text:e.target.value})}
    const add=()=>{
        dispatch(addPost(post))
        setpost({...post,text:""})
    }
    return (
        <div class="card" style={{border:"2px solid #00695c" }}>  
            <div className="card-header default-color-dark text-white">
                Say Somthing...
            </div>  
            <div className="card-body">   
                <form onSubmit={add}>
                    <input className="form-control" placeholder="Create a post" type="text" onFocus={()=>setErrors(null)} value={post.text} onChange={handleChange}/>
                    {errors&& <p>{errors.msg}</p>}
                    <button type="submit" className="btn text-white default-color-dark">submit</button> 
                </form> 
            </div>             
        </div>
    )
}

export default NewPost  