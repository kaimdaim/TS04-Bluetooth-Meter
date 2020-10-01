item: any[] = [];

/*
* Fetches code from storage and assigns it to variables if any
*/
constructor()
this.storage.get('item').then((res) => {
        if(res){
          this.item = res;
       }
});
}


addFavorite(url: string) {
    return this.postsService.getDetails(url).subscribe(res => {
     this.item.push(res);
      // Saving item array instead of res value.
      this.storage.set('item',  this.item)
        .then(
          () => {
            console.log('Item Stored');
          },
          error => console.error('Error storing item', error)
        );
   
      return res;
    });
  }
