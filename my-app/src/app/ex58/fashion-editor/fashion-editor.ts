import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import Quill from 'quill';

// WYSIWYG (What You See Is What You Get) HTML editor based on Quill
@Component({
  selector: 'app-fashion-editor',
  standalone: false,
  templateUrl: './fashion-editor.html',
  styleUrl: './fashion-editor.css',
  encapsulation: ViewEncapsulation.None,
})
export class FashionEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editorHost') editorHost!: ElementRef<HTMLDivElement>
  @Input() value: string = ''
  @Output() valueChange = new EventEmitter<string>()
  private quill?: Quill
  private lastValue = ''

  ngAfterViewInit() {
    this.quill = new Quill(this.editorHost.nativeElement, {
      theme: 'snow',
      placeholder: 'Write the fashion detail here...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
      },
    })
    this.setHtml(this.value)
    this.quill.on('text-change', () => {
      const html = this.quill!.getSemanticHTML()
      this.lastValue = html
      this.valueChange.emit(html)
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && this.quill && this.value !== this.lastValue) {
      this.setHtml(this.value)
    }
  }

  private setHtml(html: string) {
    if (!this.quill) return
    this.lastValue = html || ''
    const delta = this.quill.clipboard.convert({ html: html || '' })
    this.quill.setContents(delta, 'silent')
  }

  ngOnDestroy() {
    this.quill = undefined
  }
}
