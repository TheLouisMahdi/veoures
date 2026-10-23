import {DatabaseSync} from 'node:sqlite';
export function localD1(file=':memory:'){
 const database=new DatabaseSync(file);database.exec('PRAGMA busy_timeout=5000;');
 function execute(sql,args){const statement=database.prepare(sql);if(/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql))return{success:true,results:statement.all(...args),meta:{changes:0}};const result=statement.run(...args);return{success:true,results:[],meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}}}
 function prepare(sql){return{sql,args:[],bind(...args){return{...this,args}},async first(){return execute(this.sql,this.args).results[0]||null},async run(){return execute(this.sql,this.args)},async all(){return execute(this.sql,this.args)}}}
 return{database,prepare,async batch(statements){database.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>execute(s.sql,s.args));database.exec('COMMIT');return results}catch(error){database.exec('ROLLBACK');throw error}}};
}
