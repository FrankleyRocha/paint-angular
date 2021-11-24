import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';

import * as LZString from 'lz-string';

const maxHeight = 100;
const maxWidth = 100;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipboard: Clipboard
  ) { }

  processing : boolean = false;

  canvas! : any[];

  initCanvas(){

    for(let i=0;i<maxWidth;i++)
      for(let j=0;j<maxHeight;j++)
        this.canvas.push({
          color:0
        });
  }

  ngOnInit(): void {

    let canvas = this.route.snapshot.paramMap.get('canvas');
    //console.log('canvas',canvas);

    this.canvas = this.str2canvas(
      LZString.decompressFromEncodedURIComponent( canvas || '') || ''
    );
        
    if(this.canvas === undefined || this.canvas.length === 0)
      this.load();
            
  }

  pixelClick(pixel:any) {
    pixel.color= pixel.color ? 0 : 1;
  }

  processAction(action : any){
        
    this.processing = true;    
    setTimeout(() => {
      action();
      setTimeout(() => {
        this.processing = false;
      },100);
    },100);
            
  }

  str2canvas(s:string):any{
    let canvas:any[] = [];
    
    if(s !== undefined && s.length !== 0)
      for(let i=0;i<s.length;i++)
        canvas.push(
          { color : ( s.charAt(i) === '1' ? 1 : 0 ) }
        )

    return canvas;
  }

  canvas2str(canvas:any){
    let s = '';
    for(let pixel of canvas){
      s += pixel.color;
    }
    return s;
  }

  save(){
    this.processAction( ()=> {      
      localStorage.setItem('canvas', LZString.compressToEncodedURIComponent(this.canvas2str(this.canvas)));    
    });
  }

  clear(){    
    this.processAction( ()=> {
      this.canvas.forEach( pixel => {
        pixel.color = 0;
      });
    });
  }

  load(){    
    this.processAction( ()=> {
      this.canvas = this.str2canvas(
        LZString.decompressFromEncodedURIComponent( localStorage.getItem('canvas') || '') || ''
      );
      if(this.canvas.length===0)
        this.initCanvas();
    });
  }

  share(){
    let link = LZString.compressToEncodedURIComponent(this.canvas2str(this.canvas));

    this.clipboard.copy(
      link
    );

    this.router.navigate([`/${link}`]);
  }

}
