import { useForm } from "../../hooks/useForm";
import { useService } from "../../hooks/useService";
import workflowServiceFactory from "../../api/services/workflowServiceFactory";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { loadFormData } from "../../utils/handleFormData";
import styles from "./CreateWorkflow.module.css"

import WorkflowCreateEditNav from "./WorkflowCreateEditNav";
import { useNavigate, useParams } from "react-router";

export default function CreateWorkflow(){
    const workflowApi=useService(workflowServiceFactory);
    const navigate=useNavigate();
    const ctxGlobal=useContext(GlobalContext);
    const [roles,setRoles]=useState([]);
    const [statuses,setStatuses]=useState([]);
    const {id}=useParams();
    const {        
            onChangeUserForm,
            onSubmitUserForm,
            formData,
            updateSomeFormFields,
           }=useForm(
                    {
                        workflowName:'',
                        rolesAllowedToFinishRequest:[],
                        initialStatus:'',
                    },handleOnSbmtWorkflowCreateFrm);
                    
    function handleOnSbmtWorkflowCreateFrm(){
        try {
            let action=id?workflowApi.editWorkflow:workflowApi.createworkflows;
            const checkedData=loadFormData(formData);
            action(checkedData,id)
            .then(()=>{
                navigate('/workflows');
              })
              .catch((err)=>{
                ctxGlobal.handleError(err);
              })            
            } catch (error) {
                ctxGlobal.handleError(error);
            }
    }                
    useEffect(()=>{
        workflowApi.roles()
        .then((data)=>{
            setRoles(data);
           
        }).catch((err)=>{

            ctxGlobal.handleError(err);
        });
        workflowApi.statuses()
        .then((data)=>{
            data.sort((stat1,stat2)=>{
                if(stat1.statusType.role.toLowerCase()>stat2.statusType.role.toLowerCase()){
                  return -1
                }else{
                  return 1
                }
              });
            updateSomeFormFields({initialStatus:data[0]?._id}); 
            setStatuses(data);          
        }).catch((err)=>{
      
            ctxGlobal.handleError(err);
        });
        if(id){
            workflowApi.getWorkflowById(id)
            .then((data)=>{
                updateSomeFormFields({
                    workflowName:data.workflowName,
                    initialStatus:data.initialStatus,
                    rolesAllowedToFinishRequest:data.rolesAllowedToFinishRequest.map(role=>role._id),
                }); 
            })
            .catch((err)=>{
     
                ctxGlobal.handleError(err);
            })
        }
    },[id]);



    return (
    
        <section id="createWorkflow">
            <WorkflowCreateEditNav/>
            <div className={styles["formLarge"]}>
            <h2>Create Workflow</h2>
            
            <form className={styles["inlineDiv"]} onSubmit={onSubmitUserForm}>
            <label for='workflowName'>Workflow Name</label>
                <input 
                    onChange={onChangeUserForm}
                    value={formData.workflowName}
                    type="text" 
                    name="workflowName" 
                    id="workflowName" 
                    placeholder="Name of the workflow" 
                />
                
                <label for='rolesAllowedToFinishRequest'>Super Users</label>

                <select 
                    className={styles["multi"]}
                    onChange={onChangeUserForm}
                    value={formData.rolesAllowedToFinishRequest}                
                    multiple 
                    name="rolesAllowedToFinishRequest" 
                    id="rolesAllowedToFinishRequest"
                >
                  
                    {roles.map((role)=><option key={role._id} value={role._id}>{role.role}</option>)}
                </select>
                
                <label for='initialStatus'>Initial Status</label>

                <select 
                    onChange={onChangeUserForm}
                    value={formData.initialStatus}                    
                    name='initialStatus' 
                    id='initialStatus'
                >
                    {statuses.map((stat)=><option key={stat._id} value={stat._id}>{stat.statusType.role}: {stat.statusName}</option>)}
                </select>
                <button type="submit">Save</button>
                
                </form>
            

            </div>
        </section>
    )
}