import { Injectable, HttpException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { endOfWeek, startOfWeek } from "date-fns";
import { TRANSACTION_TYPE } from "src/modules/enums/transaction-type.enum";
import { TransactionEntity } from "src/modules/transactions/entities/transaction.entity";
import {Repository, EntityManager } from 'typeorm';
import { Between } from "typeorm/find-options/operator/Between";
import { LessThanOrEqual } from "typeorm/find-options/operator/LessThanOrEqual";
import { MoreThanOrEqual } from "typeorm/find-options/operator/MoreThanOrEqual";
Injectable()
export class StreakService{

        constructor(
            @InjectRepository(TransactionEntity)
            private transactionRepository:Repository<TransactionEntity>,
            private em:EntityManager,
        ){}

    async getUsersStreak(user_id:string){
       
        const transaction = await this.em.find(TransactionEntity, {
            where: {
                transactionType : TRANSACTION_TYPE.DEPOSIT, 
                createdAt:Between( this.getStartOfWeek(), this.getEndOfWeek()) 
        
          },
          
        
        })
       
    }
    // async todaysDate(){
    //     return this.formatDate()
    // }
        
    //     async formatDate(date = null){
    //         if(date){
    //             return new Date(date).toISOString().slice(0, 10)
    //         }
    //         return new Date().toISOString().slice(0, 10)
    //     }
        async getDayData(){
            return {
                Monday: { status: false, fullDate: null },
                Tuesday: { status: false, fullDate: null },
                Wednesday: { status: false, fullDate: null },
                Thursday: { status: false, fullDate: null },
                Friday: { status: false, fullDate: null },
                Saturday: { status: false, fullDate: null },
                Sunday: { status: false, fullDate: null },
            }
        }

        async getDayOfTheWeek(date){
            const format = require('date-fns/format')
            return format(new Date(date), 'eeee')
        }
        async getDayInterval(start, end){
            var eachDayInterval = require('date-fns/eachDayOfInterval')
            var addDays = require('date-fns/addDays')
            const newEnd = addDays(end, 1)
            return eachDayInterval({
                start: new Date(start),
                end: new Date(newEnd),
            })
        }
        // implement start of week


        getStartOfWeek(){
          
            const results = startOfWeek(new Date(), {weekStartsOn: 1})
            return results
        }
        getEndOfWeek() {
        
            const results = endOfWeek(new Date(), {
            weekStartsOn:1,
            })
            return results
        }
  
}

 //   const dayData = this.getDayData()
        //   const formatted = transaction.map((item)=>{
        //     dayData[getDayOfTheWeek(item.createdAt)]={
        //         status: item.amount ? true: false,
        //         fulDate: item.createdAt,
        //     }
        //     return dayData
        //   })
        //   if(!formatted.length){
        //     this.formatted = dayData
        //   }
        //   const unique = formatted.length ? this.uniqueArray(formatted)[0] : formatted
        //   const intervals = this.getDayInterval(this.startOfWeek(), this.endOfWeek())
        //   for (let i = 0; i <= intervals.length; i++) {
        //     if (intervals[i]) {
        //       const intDay = this.getDayOfTheWeek(intervals[i])
        //       const intervalData = unique[intDay]
        //       unique[intDay] = {
        //         ...intervalData,
        //         fullDate:
        //           intervalData.status === false ? intervals[i] : intervalData.fullDate,
        //       }
        //     }
        //   }
        //   return unique