export function convertDurationToTimeString(duration: number) {
    //Math.floor : serve para a redondar para menos
    /* 3600  = 60min * 60seg ou seja a duration é em segundos e para converter para horas eu preciso 
     1º dividir esse tempo por 60min(1hrs) para converter em minutos  e depois por 60 novamente para converter em horas*/
    const hours = Math.floor (duration / 3600) ;
     /*pego o resto da divisão de duration , ou seja os segundos com 3600(Segundos) dividido por 60 para ter o numero de minutos*/
    const minutes = Math.floor((duration % 3600)/ 60);
    const seconds = duration % 60;

    //Criando a strin com hh:mi:seg
    const timeString = [hours, minutes, seconds]
    /*pecorro o array com map e para cada uma das unidadaes eu converto em string e com o padStart eu sempre mantenho
     a hora, min e seg com 2 caracteres , ou seja, se o retorno da hora for '1' ele joga o 0 na frente '01'*/
    .map(unit => String(unit).padStart(2, '0'))
    .join(':')

    return timeString;
}