module.exports = {
    convertFromDBtoRealPath(dbvalue) {
      return `${process.env.BASEPATH}${dbvalue}`;
    },
    setFromFileNameToDBValue(filename) {
      return `/public/${filename}`;
    },

    getAbsolutePathPublicFile(filename) {
      return `${__dirname}/../Public/${filename}`;
    },
  
    getFilenameFromDbValue(dbValue) {
    if (!dbValue || dbValue === '') {
      return '';
    }
    const split = dbValue.split('/');
    if (split.length < 3) {
      return '';
    }
    return split[2];
  }
  };