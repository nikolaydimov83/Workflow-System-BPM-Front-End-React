import { useContext, useEffect, useState } from "react"
import { useForm } from "../../hooks/useForm"
import { useNavigate, useParams } from "react-router"
import { useService } from "../../hooks/useService";
import dashboardServiceFactory from "../../api/services/dashboardServiceFactory";
import { GlobalContext } from "../../contexts/GlobalContext";
import { stringifyDates } from "../../utils/handleDates";
import { loadFormData } from "../../utils/handleFormData";
import styles from './CreateComment.module.css'

export default function CreateComment(){
    const {id}=useParams();
    const dashApi=useService(dashboardServiceFactory);
    const [createViewState,setCreateViewState]=useState({});
    const ctxGlobal=useContext(GlobalContext);
    const navigate=useNavigate();
    const {
        onChangeUserForm,
        onSubmitUserForm,
        formData
    } = useForm({commentText:''},handleNewCommentFrmSbmt)
    
    function handleNewCommentFrmSbmt(){
        try {
            let checkedData=loadFormData(formData);
            let serverResponseData=dashApi.createComment(id,checkedData)
            .then(()=>{
              navigate('/dashboard/'+id)
            })
            .catch((err)=>{
              ctxGlobal.handleError(err);
            })
            
          
          } catch (error) {
            ctxGlobal.handleError(error);
          }
    }
useEffect(()=>{
    dashApi.getById(id)
    .then((data)=>{
        data.comments=data.comments.sort((a,b)=>{
            return ((new Date(b.commentDate) - new Date(a.commentDate)));
        })
        let dataStringifiedDates=stringifyDates([data]);
        dataStringifiedDates=dataStringifiedDates[0];
        let lastCommnet;
        if(data.comments.length){
            lastCommnet=data.comments[0]
          }
        setCreateViewState({...dataStringifiedDates,lastCommnet});
    })
    .catch((err)=>{
        navigate('/dashboard/'+id);
        ctxGlobal.handleError(err);
    })
    return () => {
      ctxGlobal.clearFieldStatuses();
    }
},[id])
    return (
<section id="create">
<div className={styles["formLarge"]}>
  
  <div className={styles["inlineDiv"]}>
  <h4>Информация за заявката</h4>
    <p class="details-cretae-comment"><span>ФЦ/Рефериращ ФЦ</span>:  {createViewState.finCenter}/{createViewState.refferingFinCenter?createViewState.refferingFinCenter:`Няма рефериращ`}</p>
    <p class="details-cretae-comment"><span>Номер I-apply</span>:  {createViewState.iApplyId}</p>
    <p class="details-cretae-comment"><span>ЕГН/Булстат</span>:   {createViewState.clientEGFN}</p>
    <p class="details-cretae-comment"><span>Клиент</span>:   {createViewState.clientName}</p>
    <p class="details-cretae-comment"><span>Продукт</span>:    {createViewState.product}</p>
    <p class="details-cretae-comment"><span>Сума</span>:  {createViewState.ccy} {createViewState.amount}</p>
    <p class="details-cretae-comment"><span>Статус</span>:  {createViewState?.status?.statusName}</p>
    <p class="details-cretae-comment"><span>Изпратен от</span>:  {createViewState.statusSender}</p>
    <p class="details-cretae-comment"><span>Изпратен на дата</span>:  {createViewState.statusIncomingDate}</p>
    <p class="details-cretae-comment"><span>Краен срок</span>:  {createViewState.deadlineDate}</p>
    <p class="details-cretae-comment"><span>Последен коментар</span>:  {createViewState?.lastCommnet?.body}</p>
  </div>

    
    <form onSubmit={onSubmitUserForm} className={styles["inlineDiv"]}>
    <h3>Напиши коментар</h3>
        <textarea 
          value={formData.commentText} 
          onChange={onChangeUserForm} 
          type="textarea" name="commentText" 
          id="commentText" 
          placeholder="Описание"
          className={ctxGlobal.fieldStatuses?.commentText?styles['error']:''}
          >
            
          </textarea>
        <button type="submit">Изпрати</button>
    </form>
      

  
</div>
</section>

    )
}